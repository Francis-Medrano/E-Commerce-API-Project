import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../../lib/supabase'
import '../../pages/CartPage/CartPage.css'
import Header from '../../components/Header/Header'

type Product = {
  id: number
  imgURL: string
  price: number
  name: string
}

type CartItem = {
  product_id: number
  quantity: number
}

type CartLine = CartItem & {
  product: Product
}

function isProduct(value: unknown): value is Product {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const product = value as Record<string, unknown>
  return (
    typeof product.id === 'number' &&
    typeof product.imgURL === 'string' &&
    typeof product.price === 'number' &&
    typeof product.name === 'string'
  )
}

function CartPage() {
  const [cartLines, setCartLines] = useState<CartLine[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [updatingProductId, setUpdatingProductId] = useState<number | null>(null)
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [checkoutMessage, setCheckoutMessage] = useState('')
  const [draftQuantities, setDraftQuantities] = useState<Record<number, string>>({})

  const loadCart = async () => {
    setError('')

    const [{ data: userData, error: userError }, productsResponse] = await Promise.all([
      supabase.auth.getUser(),
      fetch('/products.json'),
    ])

    if (userError) {
      throw new Error(userError.message)
    }

    if (!userData.user) {
      setIsAuthenticated(false)
      setCartLines([])
      return
    }

    if (!productsResponse.ok) {
      throw new Error('Unable to load product details.')
    }

    const productsData: unknown = await productsResponse.json()
    if (!Array.isArray(productsData) || !productsData.every(isProduct)) {
      throw new Error('Product data is not available.')
    }

    const { data: items, error: cartError } = await supabase
      .from('cart_items')
      .select('product_id, quantity')
      .eq('user_id', userData.user.id)
      .order('created_at', { ascending: true })

    if (cartError) {
      throw new Error(cartError.message)
    }

    const products = new Map(productsData.map((product) => [product.id, product]))
    const lines = (items as CartItem[])
      .map((item) => {
        const product = products.get(item.product_id)
        return product ? { ...item, product } : null
      })
      .filter((line): line is CartLine => line !== null)

    setIsAuthenticated(true)
    setCartLines(lines)
  }

  useEffect(() => {
    void loadCart()
      .catch((loadError: unknown) => {
        setError(loadError instanceof Error ? loadError.message : 'Unable to load your cart.')
      })
      .finally(() => setIsLoading(false))
  }, [])

  const subtotal = useMemo(
    () => cartLines.reduce((total, line) => total + line.product.price * line.quantity, 0),
    [cartLines],
  )

  const checkout = async () => {
    setIsCheckingOut(true)
    setError('')
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser()
      if (userError || !userData.user) throw new Error('Please log in to check out.')
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({ user_id: userData.user.id, total: subtotal, status: 'placed' })
        .select('id')
        .single()
      if (orderError || !order) throw new Error(orderError?.message ?? 'Unable to create your order.')
      const { error: itemsError } = await supabase.from('order_items').insert(
        cartLines.map((line) => ({
          order_id: order.id,
          product_id: line.product_id,
          product_name: line.product.name,
          product_image: line.product.imgURL,
          unit_price: line.product.price,
          quantity: line.quantity,
        })),
      )
      if (itemsError) {
        await supabase.from('orders').delete().eq('id', order.id)
        throw new Error(itemsError.message)
      }
      const { error: clearError } = await supabase.from('cart_items').delete().eq('user_id', userData.user.id)
      if (clearError) throw new Error(clearError.message)
      setIsCheckoutOpen(false)
      setCheckoutMessage('Checkout complete. Your purchase is now in My Purchases.')
      await loadCart()
    } catch (checkoutError) {
      setError(checkoutError instanceof Error ? checkoutError.message : 'Unable to complete checkout.')
    } finally {
      setIsCheckingOut(false)
    }
  }

  const updateQuantity = async (productId: number, quantity: number) => {
    setUpdatingProductId(productId)
    setError('')

    try {
      const { data: userData, error: userError } = await supabase.auth.getUser()
      if (userError || !userData.user) {
        throw new Error('Please log in to manage your cart.')
      }
      if (quantity === 0) {
        const { error: deleteError } = await supabase
          .from('cart_items')
          .delete()
          .eq('user_id', userData.user.id)
          .eq('product_id', productId)

        if (deleteError) {
          throw new Error(deleteError.message)
        }
      } else {
        const { error: updateError } = await supabase
          .from('cart_items')
          .update({ quantity })
          .eq('user_id', userData.user.id)
          .eq('product_id', productId)

        if (updateError) {
          throw new Error(updateError.message)
        }
      }

      await loadCart()
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Unable to update your cart.')
    } finally {
      setUpdatingProductId(null)
    }
  }

  return (
    <main className="cart-page">
      <Header />

      <section className="cart-content" aria-labelledby="cart-title">
        <div className="cart-heading">
          <div>
            <p className="cart-eyebrow">Your basket</p>
            <h1 id="cart-title">Shopping cart</h1>
          </div>
          {!isLoading && isAuthenticated && <span>{cartLines.length} items</span>}
        </div>

        {isLoading && <p className="cart-status">Loading your cart...</p>}
        {!isLoading && !isAuthenticated && (
          <div className="cart-empty">
            <h2>Log in to see your cart</h2>
            <p>Your cart is saved to your account so it is available on every device.</p>
            <a className="cart-primary-button" href="/login">
              Log in
            </a>
          </div>
        )}
        {error && (
          <p className="cart-status cart-error" role="alert">
            {error}
          </p>
        )}
        {!isLoading && isAuthenticated && !error && cartLines.length === 0 && (
          <div className="cart-empty">
            <h2>Your cart is empty</h2>
            <p>Find something fresh to add to your basket.</p>
            <a className="cart-primary-button" href="/">
              Continue shopping
            </a>
          </div>
        )}

        {!isLoading && isAuthenticated && !error && cartLines.length > 0 && (
          <div className="cart-layout">
            <div className="cart-items">
              {cartLines.map((line) => (
                <article className="cart-item" key={line.product_id}>
                  <img src={line.product.imgURL} alt={line.product.name} />
                  <div className="cart-item-details">
                    <a href={`/product/${line.product.id}`}>{line.product.name}</a>
                    <p>${line.product.price.toFixed(2)} each</p>
                    <div className="quantity-control" aria-label={`Quantity of ${line.product.name}`}>
                      <button
                        type="button"
                        aria-label={`Decrease ${line.product.name} quantity`}
                        disabled={updatingProductId === line.product_id}
                        onClick={() => void updateQuantity(line.product_id, line.quantity - 1)}
                      >
                        −
                      </button>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={draftQuantities[line.product_id] ?? String(line.quantity)}
                        disabled={updatingProductId === line.product_id}
                        aria-label={`Quantity of ${line.product.name}`}
                        onChange={(event) => {
                          setDraftQuantities({ ...draftQuantities, [line.product_id]: event.target.value })
                        }}
                        onBlur={() => {
                          const nextQuantity = Number(draftQuantities[line.product_id])
                          if (Number.isInteger(nextQuantity) && nextQuantity > 0 && nextQuantity !== line.quantity) {
                            void updateQuantity(line.product_id, nextQuantity)
                          } else {
                            setDraftQuantities((current) => {
                              const remaining = { ...current }
                              delete remaining[line.product_id]
                              return remaining
                            })
                          }
                        }}
                      />
                      <button
                        type="button"
                        aria-label={`Increase ${line.product.name} quantity`}
                        disabled={updatingProductId === line.product_id}
                        onClick={() => void updateQuantity(line.product_id, line.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <strong>${(line.product.price * line.quantity).toFixed(2)}</strong>
                  <button
                    className="remove-item"
                    type="button"
                    disabled={updatingProductId === line.product_id}
                    onClick={() => void updateQuantity(line.product_id, 0)}
                  >
                    Remove
                  </button>
                </article>
              ))}
            </div>

            <aside className="cart-summary" aria-labelledby="summary-title">
              <h2 id="summary-title">Order summary</h2>
              <div>
                <span>Subtotal</span>
                <strong>${subtotal.toFixed(2)}</strong>
              </div>
              <div>
                <span>Delivery</span>
                <span>Calculated at checkout</span>
              </div>
              <button type="button" onClick={() => setIsCheckoutOpen(true)}>
                Checkout
              </button>
            </aside>
          </div>
        )}
        {checkoutMessage && <p className="cart-success" role="status">{checkoutMessage}</p>}
        {isCheckoutOpen && (
          <div className="checkout-modal-backdrop" role="presentation">
            <section className="checkout-modal" role="dialog" aria-modal="true" aria-labelledby="checkout-title">
              <h2 id="checkout-title">Confirm checkout</h2>
              <p>Place this order for ${subtotal.toFixed(2)}?</p>
              <div className="checkout-modal-actions">
                <button type="button" onClick={() => setIsCheckoutOpen(false)} disabled={isCheckingOut}>Cancel</button>
                <button type="button" onClick={() => void checkout()} disabled={isCheckingOut}>
                  {isCheckingOut ? 'Processing...' : 'Confirm checkout'}
                </button>
              </div>
            </section>
          </div>
        )}
      </section>
    </main>
  )
}

export default CartPage
