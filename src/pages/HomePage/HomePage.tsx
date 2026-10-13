import { useEffect, useState } from 'react'
import '../../css/HomePage/HomePage.css'

type Product = {
  id: number
  imgURL: string
  name: string
  price: number
}

function isProduct(value: unknown): value is Product {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const product = value as Record<string, unknown>

  return (
    typeof product.id === 'number' &&
    typeof product.imgURL === 'string' &&
    typeof product.name === 'string' &&
    typeof product.price === 'number'
  )
}

function HomePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await fetch('/products.json')

        if (!response.ok) {
          throw new Error('Unable to load products.')
        }

        const data: unknown = await response.json()

        if (!Array.isArray(data) || !data.every(isProduct)) {
          throw new Error('Product data is not available.')
        }

        setProducts(data)
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Unable to load products.')
      } finally {
        setIsLoading(false)
      }
    }

    void loadProducts()
  }, [])

  return (
    <main className="home-page">
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

      <section className="home-intro" aria-labelledby="home-title">
        <p className="home-eyebrow">Fresh picks, delivered</p>
        <h1 id="home-title">Good food starts here.</h1>
        <p>Shop fresh, delicious fruit for every moment.</p>
      </section>

      <section className="product-section" aria-labelledby="products-title">
        <div className="section-heading">
          <h2 id="products-title">Popular products</h2>
          {!isLoading && !error && <span>{products.length} items</span>}
        </div>

        {isLoading && <p className="product-status">Loading products...</p>}
        {error && (
          <p className="product-status product-error" role="alert">
            {error}
          </p>
        )}

        {!isLoading && !error && (
          <div className="product-grid">
            {products.map((product) => (
              <a className="product-card" href={`/product/${product.id}`} key={product.id}>
                <div className="product-image-wrapper">
                  <img
                    src={product.imgURL}
                    alt={product.name}
                    className="product-image"
                    loading="lazy"
                  />
                </div>
                <div className="product-details">
                  <h3>{product.name}</h3>
                  <p className="product-price">${product.price.toFixed(2)}</p>
                </div>
              </a>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}

export default HomePage
