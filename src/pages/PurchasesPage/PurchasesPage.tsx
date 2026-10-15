import { useEffect, useState } from 'react'
import Header from '../../components/Header/Header'
import { useAuth } from '../../context/AuthContext/useAuth'
import { supabase } from '../../lib/supabase'
import '../../css/AccountPage/AccountPage.css'

type Purchase = { id: number; product_name: string; product_image: string; unit_price: number; quantity: number; created_at: string }

function PurchasesPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) return
    void supabase.from('order_items').select('id, product_name, product_image, unit_price, quantity, created_at, orders!inner(user_id)').eq('orders.user_id', user.id).order('created_at', { ascending: false }).then(({ data, error: loadError }) => {
      if (loadError) setError(loadError.message)
      else setPurchases((data ?? []) as Purchase[])
    })
  }, [user])

  return <main className="account-page"><Header /><section className="account-content"><div className="account-heading"><p>Your order history</p><h1>My Purchases</h1></div>{isLoading && <p className="account-status">Loading...</p>}{!isLoading && !isAuthenticated && <p className="account-status">Please <a href="/login">log in</a> to see your purchases.</p>}{error && <p className="account-error" role="alert">{error}</p>}{isAuthenticated && !error && purchases.length === 0 && <p className="account-muted">You have not checked out any products yet.</p>}{purchases.length > 0 && <div className="purchase-grid">{purchases.map((purchase) => <article className="purchase-card" key={purchase.id}><img src={purchase.product_image} alt={purchase.product_name} /><div><h2>{purchase.product_name}</h2><p>Quantity: {purchase.quantity}</p><strong>${(purchase.unit_price * purchase.quantity).toFixed(2)}</strong><small>{new Date(purchase.created_at).toLocaleDateString()}</small></div></article>)}</div>}</section></main>
}

export default PurchasesPage
