import { useEffect, useState } from 'react'
import '../../css/ProductPage/ProductPage.css'
import Header from '../../components/Header/Header'
import { supabase } from '../../lib/supabase'

type Product = {
  id: number
  imgURL: string
  price: number
  name: string
  description: string
  rating: number
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
    typeof product.name === 'string' &&
    typeof product.description === 'string' &&
    typeof product.rating === 'number'
  )
}

function ProductPage() {
  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionMessage, setActionMessage] = useState('')
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const productId = Number(window.location.pathname.split('/').pop())

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const response = await fetch('/products.json')

        if (!response.ok) {
          throw new Error('Unable to load product details.')
        }

        const data: unknown = await response.json()

        if (!Array.isArray(data) || !data.every(isProduct)) {
          throw new Error('Product data is not available.')
        }

        const selectedProduct = data.find((item) => item.id === productId)

        if (!selectedProduct) {
          throw new Error('Product not found.')
        }

        setProduct(selectedProduct)
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Unable to load product details.')
      } finally {
        setIsLoading(false)
      }
    }

    void loadProduct()
  }, [productId])

  const addToCart = async () => {
    if (!product) return

    setActionMessage('')
    setIsAddingToCart(true)

    try {
      const { data: userData, error: userError } = await supabase.auth.getUser()
      if (userError || !userData.user) {
        throw new Error('Please log in before adding items to your cart.')
      }

      const { data: existingItem, error: lookupError } = await supabase
        .from('cart_items')
        .select('quantity')
        .eq('user_id', userData.user.id)
        .eq('product_id', product.id)
        .maybeSingle()

      if (lookupError) {
        throw new Error(lookupError.message)
      }

      const { error: cartError } = await supabase.from('cart_items').upsert(
        {
          user_id: userData.user.id,
          product_id: product.id,
          quantity: (existingItem?.quantity ?? 0) + quantity,
        },
        { onConflict: 'user_id,product_id' },
      )

      if (cartError) {
        throw new Error(cartError.message)
      }

      setActionMessage(`${product.name} was added to your cart.`)
    } catch (cartError) {
      setActionMessage(cartError instanceof Error ? cartError.message : 'Unable to update your cart.')
    } finally {
      setIsAddingToCart(false)
    }
  }

  const buyNow = () => {
    if (product) {
      setActionMessage('')
      setIsCheckoutOpen(true)
    }
  }

  const checkout = async () => {
    if (!product) return

    setIsCheckingOut(true)
    setActionMessage('')

    try {
      const { data: userData, error: userError } = await supabase.auth.getUser()
      if (userError || !userData.user) {
        throw new Error('Please log in to check out.')
      }

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({ user_id: userData.user.id, total: product.price * quantity, status: 'placed' })
        .select('id')
        .single()

      if (orderError || !order) {
        throw new Error(orderError?.message ?? 'Unable to create your order.')
      }

      const { error: itemError } = await supabase.from('order_items').insert({
        order_id: order.id,
        product_id: product.id,
        product_name: product.name,
        product_image: product.imgURL,
        unit_price: product.price,
        quantity,
      })

      if (itemError) {
        await supabase.from('orders').delete().eq('id', order.id)
        throw new Error(itemError.message)
      }

      setIsCheckoutOpen(false)
      setActionMessage('Checkout complete. Your purchase is now in My Purchases.')
    } catch (checkoutError) {
      setActionMessage(checkoutError instanceof Error ? checkoutError.message : 'Unable to complete checkout.')
    } finally {
      setIsCheckingOut(false)
    }
  }

  return (
    <main className="product-page">
      <Header />

      {isLoading && <p className="product-page-status">Loading product...</p>}
      {error && (
        <div className="product-page-status product-page-error" role="alert">
          <p>{error}</p>
          <a href="/">Return to products</a>
        </div>
      )}

      {!isLoading && !error && product && (
        <article className="product-detail">
          <div className="product-detail-image-wrapper">
            <img className="product-detail-image" src={product.imgURL} alt={product.name} />
          </div>

          <div className="product-detail-content">
            <p className="product-detail-eyebrow">Fresh pick</p>
            <h1>{product.name}</h1>
            <div className="product-rating" aria-label={`Rated ${product.rating} out of 5`}>
              <span aria-hidden="true">★</span> {product.rating} / 5
            </div>
            <p className="product-detail-price">${product.price.toFixed(2)}</p>
            <p className="product-description">{product.description}</p>
            
            <div className="product-actions">
              <div className="product-quantity" aria-label={`Quantity of ${product.name}`}>
                <span>Quantity</span>
                <button
                  type="button"
                  aria-label={`Decrease ${product.name} quantity`}
                  disabled={quantity <= 1}
                  onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                >
                  −
                </button>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={quantity}
                  onChange={(event) => setQuantity(Math.max(1, Number(event.target.value) || 1))}
                  aria-label="Product quantity"
                />
                <button
                  type="button"
                  aria-label={`Increase ${product.name} quantity`}
                  onClick={() => setQuantity((current) => current + 1)}
                >
                  +
                </button>
              </div>
              <button type="button" className="add-to-cart-button" onClick={() => void addToCart()} disabled={isAddingToCart}>
                {isAddingToCart ? 'Adding...' : 'Add To Cart'}
              </button>
              <button type="button" className="buy-now-button" onClick={buyNow}>
                Buy Now
              </button>
            </div>

            {actionMessage && (
              <p className="product-action-message" role="status">
                {actionMessage}
              </p>
            )}
          </div>
        </article>
      )}
      {isCheckoutOpen && product && (
        <div className="product-modal-backdrop">
          <section className="product-modal" role="dialog" aria-modal="true" aria-labelledby="product-checkout-title">
            <p className="product-modal-eyebrow">Order confirmation</p>
            <h2 id="product-checkout-title">Confirm checkout</h2>
            <p>Place {quantity} {product.name} for ${(product.price * quantity).toFixed(2)}?</p>
            <div className="product-modal-actions">
              <button type="button" className="modal-cancel-button" onClick={() => setIsCheckoutOpen(false)} disabled={isCheckingOut}>
                Cancel
              </button>
              <button type="button" className="modal-confirm-button" onClick={() => void checkout()} disabled={isCheckingOut}>
                {isCheckingOut ? 'Processing...' : 'Confirm checkout'}
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  )
}

export default ProductPage
