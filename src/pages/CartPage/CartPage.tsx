import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../../lib/supabase'
import '../../css/CartPage/CartPage.css'
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
                      <span>{line.quantity}</span>
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
              <button type="button" disabled>
                Checkout coming soon
              </button>
            </aside>
          </div>
        )}
      </section>
    </main>
  )
}

export default CartPage
