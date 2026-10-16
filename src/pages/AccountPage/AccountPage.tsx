import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import Header from '../../components/Header/Header'
import { useAuth } from '../../context/AuthContext/useAuth'
import { supabase } from '../../lib/supabase'
import '../../pages/AccountPage/AccountPage.css'

type Address = {
  id: number
  name: string
  phone: string
  province: string
  city: string
  barangay: string
  postal_code: string
  street: string
  building: string
  house_number: string
}

const emptyAddress = {
  name: '',
  phone: '',
  province: '',
  city: '',
  barangay: '',
  postal_code: '',
  street: '',
  building: '',
  house_number: '',
}

function AccountPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const section = window.location.pathname.split('/')[2] || 'profile'
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [addressModalOpen, setAddressModalOpen] = useState(false)
  const [address, setAddress] = useState(emptyAddress)
  const [addresses, setAddresses] = useState<Address[]>([])

  useEffect(() => {
    if (section !== 'address' || !user) return
    void supabase.from('addresses').select('*').eq('user_id', user.id).then(({ data, error: loadError }) => {
      if (loadError) setError(loadError.message)
      else setAddresses((data ?? []) as Address[])
    })
  }, [section, user])

  if (isLoading) return <main className="account-page"><Header /><p className="account-status">Loading your account...</p></main>
  if (!isAuthenticated || !user) {
    return <main className="account-page"><Header /><div className="account-status"><h1>Log in to manage your account</h1><a className="account-button" href="/login">Log in</a></div></main>
  }

  const saveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setMessage('')
    setIsSaving(true)
    const data = new FormData(event.currentTarget)
    const updates = {
      full_name: String(data.get('name') ?? '').trim(),
      phone: String(data.get('phone') ?? '').trim(),
      gender: String(data.get('gender') ?? ''),
      birth_date: String(data.get('birthDate') ?? ''),
    }
    const { error: updateError } = await supabase.auth.updateUser({ data: updates })
    setIsSaving(false)
    if (updateError) setError(updateError.message)
    else setMessage('Profile updated successfully.')
  }

  const uploadAvatar = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setError('')
    const extension = file.name.split('.').pop() || 'jpg'
    const path = `${user.email}-${Date.now()}.${extension}`
    const { error: uploadError } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
    if (uploadError) {
      setError(uploadError.message)
      return
    }
    const { data } = supabase.storage.from('avatars').getPublicUrl(path)
    const { error: updateError } = await supabase.auth.updateUser({ data: { avatar_url: data.publicUrl } })
    if (updateError) setError(updateError.message)
    else setMessage('Profile image updated.')
  }

  const saveAddress = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    const { error: saveError } = await supabase.from('addresses').insert({ ...address, user_id: user.id })
    if (saveError) setError(saveError.message)
    else {
      setAddressModalOpen(false)
      setAddress(emptyAddress)
      setMessage('Address added.')
      const { data } = await supabase.from('addresses').select('*').eq('user_id', user.id)
      setAddresses((data ?? []) as Address[])
    }
  }

  const changePassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setMessage('')
    const data = new FormData(event.currentTarget)
    const currentPassword = String(data.get('currentPassword') ?? '')
    const newPassword = String(data.get('newPassword') ?? '')
    if (newPassword !== String(data.get('confirmPassword') ?? '')) {
      setError('New passwords do not match.')
      return
    }
    const { error: verifyError } = await supabase.auth.signInWithPassword({ email: user.email, password: currentPassword })
    if (verifyError) {
      setError('Current password is incorrect.')
      return
    }
    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword })
    if (updateError) setError(updateError.message)
    else setMessage('Password changed successfully.')
  }

  return (
    <main className="account-page">
      <Header />
      <section className="account-content">
        <div className="account-heading"><p>Account settings</p><h1>My Account</h1></div>
        <nav className="account-tabs" aria-label="Account sections">
          <a className={section === 'profile' ? 'active' : ''} href="/account/profile">Profile</a>
          <a className={section === 'address' ? 'active' : ''} href="/account/address">Address</a>
          <a className={section === 'password' ? 'active' : ''} href="/account/password">Change Password</a>
        </nav>
        {message && <p className="account-success" role="status">{message}</p>}
        {error && <p className="account-error" role="alert">{error}</p>}

        {section === 'profile' && (
          <form className="account-form" onSubmit={saveProfile}>
            <label>Name<input name="name" defaultValue={user.name} required /></label>
            <label>Email<input type="email" value={user.email} disabled /></label>
            <label>Phone number<input name="phone" defaultValue={user.phone} type="tel" /></label>
            <label>Gender<select name="gender" defaultValue={user.gender}><option value="">Prefer not to say</option><option>Male</option><option>Female</option><option>Other</option></select></label>
            <label>Birth date<input name="birthDate" defaultValue={user.birthDate} type="date" /></label>
            <label className="file-label">Profile image<input type="file" accept="image/jpeg,image/png" onChange={(event) => void uploadAvatar(event)} /></label>
            <button className="account-button" type="submit" disabled={isSaving}>{isSaving ? 'Saving...' : 'Save changes'}</button>
          </form>
        )}

        {section === 'address' && (
          <div className="address-section">
            <button className="account-button" type="button" onClick={() => setAddressModalOpen(true)}>Add address</button>
            {addresses.length === 0 ? <p className="account-muted">No saved addresses yet.</p> : addresses.map((item) => (
              <article className="address-card" key={item.id}><strong>{item.name}</strong><p>{item.phone}</p><p>{item.house_number} {item.building} {item.street}, {item.barangay}, {item.city}, {item.province} {item.postal_code}</p></article>
            ))}
          </div>
        )}

        {section === 'password' && (
          <form className="account-form" onSubmit={changePassword}>
            <label>Current password<input name="currentPassword" type="password" required /></label>
            <label>New password<input name="newPassword" type="password" minLength={6} required /></label>
            <label>Confirm password<input name="confirmPassword" type="password" minLength={6} required /></label>
            <button className="account-button" type="submit">Change password</button>
          </form>
        )}
      </section>
      {addressModalOpen && (
        <div className="account-modal-backdrop">
          <section className="account-modal" role="dialog" aria-modal="true" aria-labelledby="address-title">
            <h2 id="address-title">Add address</h2>
            <form className="address-form" onSubmit={saveAddress}>
              {([['name', 'Name'], ['phone', 'Phone number'], ['province', 'Province'], ['city', 'City'], ['barangay', 'Barangay'], ['postal_code', 'Postal code'], ['street', 'Street name'], ['building', 'Building'], ['house_number', 'House no.']] as const).map(([key, label]) => <label key={key}>{label}<input required={key !== 'building'} value={address[key]} onChange={(event) => setAddress({ ...address, [key]: event.target.value })} /></label>)}
              <div className="modal-actions"><button type="button" onClick={() => setAddressModalOpen(false)}>Cancel</button><button className="account-button" type="submit">Save address</button></div>
            </form>
          </section>
        </div>
      )}
    </main>
  )
}

export default AccountPage
