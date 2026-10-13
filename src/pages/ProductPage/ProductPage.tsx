import { useEffect, useState } from 'react'
import '../../css/ProductPage/ProductPage.css'

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

  const addToCart = () => {
    if (product) {
      setActionMessage(`${product.name} was added to your cart.`)
    }
  }

  const buyNow = () => {
    if (product) {
      setActionMessage(`You are ready to buy ${product.name}.`)
    }
  }

  return (
    <main className="product-page">
      <header className="home-header">
        <a className="home-brand" href="/" aria-label="Shoply home">
          Shoply
        </a>
        <nav aria-label="Main navigation">
          <a href="/login">Log in</a>
          <a className="home-signup" href="/signup">
            Sign up
          </a>
        </nav>
      </header>

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
              <button type="button" className="add-to-cart-button" onClick={addToCart}>
                Add To Cart
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
    </main>
  )
}

export default ProductPage
