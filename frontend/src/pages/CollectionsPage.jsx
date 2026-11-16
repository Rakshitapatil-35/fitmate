import { useEffect, useRef, useState } from 'react'
import { ArrowRight, ArrowUpRight, SlidersHorizontal } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { BrandWordmark, Button, Eyebrow } from '../components/DesignSystem.jsx'
import MobileNav from '../components/MobileNav.jsx'
import { textileDiscoveries } from '../textileDiscoveryData.js'
import { traditionalOccasions, traditionalWearCategories } from '../traditionalWearData.js'
import './CollectionsPage.css'

const audienceOptions = ['All', 'Women', 'Men']
const occasionOptions = ['All occasions', ...traditionalOccasions.map((item) => item.name)]
const fabricOptions = ['All fabrics', ...textileDiscoveries.map((item) => item.name)]
const fitOptions = ['All fits', 'Slim', 'Regular', 'Relaxed', 'Oversized']
const lehengaLooks = [
  { name: 'Bridal red', detail: 'Heirloom embroidery and a statement silhouette', image: 'photo-1595777457583-95e059d581b8' },
  { name: 'Pastel pink', detail: 'Soft colour for a lighter celebration look', image: 'photo-1617627143750-d86bc21e42bb' },
  { name: 'Ivory & gold', detail: 'Subtle sheen, considered detail', image: 'photo-1609357605129-26f69add5d6e' },
  { name: 'Emerald green', detail: 'A rich jewel tone with festive presence', image: 'photo-1610030469983-98e550d6193c' },
  { name: 'Floral', detail: 'Print and texture for daytime occasions', image: 'photo-1529139574466-a303027c1d8b' },
  { name: 'Contemporary minimal', detail: 'Clean lines with room to make it your own', image: 'photo-1539109136881-3be0616acf4b' },
  { name: 'Embroidered detail', detail: 'A closer look at fabric and craftsmanship', image: 'photo-1603217192097-13c306522271' },
]
const diwaliLooks = [
  { name: 'Diwali Sarees', image: 'photo-1610030469983-98e550d6193c', audience: 'Women', type: 'Sarees' },
  { name: 'Festive Lehengas', image: 'photo-1595777457583-95e059d581b8', audience: 'Women', type: 'Lehenga choli' },
  { name: 'Ethnic Suits', image: 'photo-1609357605129-26f69add5d6e', audience: 'Women', type: 'Anarkali suits' },
  { name: "Men's Festive Wear", image: 'photo-1597983073493-88cd35cf93b0', audience: 'Men', type: 'Kurta pajama sets' },
  { name: 'Family Celebration Looks', image: 'photo-1617627143750-d86bc21e42bb', audience: 'Women', type: 'Ethnic co-ord sets' },
]
const fashionImage = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=85`

function CollectionsPage() {
  const location = useLocation()
  const isDiwaliEdit = location.pathname === '/diwali-edit'
  const isLehengaStudio = location.pathname === '/lehenga-studio'
  const routeAudience = location.pathname === '/mens-fashion' ? 'Men' : location.pathname === '/womens-fashion' ? 'Women' : new URLSearchParams(location.search).get('audience')
  const routeOccasion = location.pathname === '/diwali-edit' ? 'Diwali' : new URLSearchParams(location.search).get('occasion')
  const routeCategory = location.pathname === '/lehenga-studio' ? 'Lehenga choli' : new URLSearchParams(location.search).get('clothingType')
  const [audience, setAudience] = useState(() => audienceOptions.includes(routeAudience) ? routeAudience : 'All')
  const [clothingType, setClothingType] = useState(() => routeCategory || 'All clothing types')
  const [occasion, setOccasion] = useState(() => occasionOptions.includes(routeOccasion) ? routeOccasion : 'All occasions')
  const [fabric, setFabric] = useState('All fabrics')
  const [fit, setFit] = useState('All fits')
  const categoryResultsRef = useRef(null)
  const filtersMounted = useRef(false)

  useEffect(() => {
    if (!filtersMounted.current) { filtersMounted.current = true; return }
    if (occasion !== 'All occasions' || fabric !== 'All fabrics') categoryResultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [occasion, fabric])

  const typeOptions = ['All clothing types', ...traditionalWearCategories
    .filter((item) => audience === 'All' || item.audience === audience)
    .map((item) => item.name)]
  const selectedOccasion = traditionalOccasions.find((item) => item.name === occasion)
  const selectedTextile = textileDiscoveries.find((item) => item.name === fabric)
  const filteredCategories = traditionalWearCategories.filter((item) => (
    (audience === 'All' || item.audience === audience)
    && (clothingType === 'All clothing types' || item.name === clothingType)
    && (!selectedOccasion || selectedOccasion.categoryIds.includes(item.id))
    && (!selectedTextile || selectedTextile.categories.includes(item.id))
    && (fit === 'All fits' || item.fitPreferences.includes(fit))
  ))

  const handleAudienceChange = (event) => {
    setAudience(event.target.value)
    setClothingType('All clothing types')
  }

  return (
    <div className="traditional-collections-page">
      <header className="collections-header">
        <BrandWordmark to="/" />
        <nav aria-label="Collections navigation">
          <Link to="/">Home</Link>
          <Link to="/how-it-works">How It Works</Link>
          <Link to="/about">About</Link>
          <Button to="/find-my-size" size="small" icon={ArrowUpRight}>Find My Size</Button>
        </nav>
        <MobileNav links={[{ to: '/', label: 'Home' }, { to: '/my-wardrobe', label: 'My Wardrobe' }, { to: '/how-it-works', label: 'How It Works' }, { to: '/find-my-size', label: 'Find My Size' }]} />
      </header>

      <main>
        <section className="collections-hero">
          <div>
            <Eyebrow>THE FITMATE EDIT · INDIAN TRADITIONAL</Eyebrow>
            <h1>{isDiwaliEdit ? <>THE DIWALI<br /><em>EDIT.</em></> : isLehengaStudio ? <>THE LEHENGA<br /><em>STUDIO.</em></> : <>Tradition, tailored<br /><em>to your fit.</em></>}</h1>
            <p>{isDiwaliEdit ? 'Dress up. Light up. Celebrate in style. Discover festive silhouettes, rich colour and considered fit guidance.' : isLehengaStudio ? 'A celebration of silhouette, surface and craft. Explore distinct lehenga moods, then find your fit using a clearly labelled sample chart.' : 'Explore Indian occasionwear and everyday classics. Browse by clothing type, occasion, fabric and the fit you prefer.'}</p>
            {!isDiwaliEdit && !isLehengaStudio && <Button to="/indian-ethnic-wear" icon={ArrowRight}>Enter 3D Indian Fashion Universe</Button>}
            {isLehengaStudio && <Button to="/find-my-size?audience=Women&category=Traditional%20wear&clothingType=Lehenga%20choli" icon={ArrowRight}>Find your perfect lehenga fit</Button>}
          </div>
          <div className="collections-hero-image">
            <img
              src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1400&q=85"
              alt="Indian-inspired traditional fashion in warm colors"
              onError={(event) => { event.currentTarget.src = 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1400&q=85' }}
            />
            <span>TRADITIONAL WEAR · A FIT FOR EVERY OCCASION</span>
          </div>
          <span className="collections-hero-side">INDIAN & WESTERN FIT GUIDANCE</span>
        </section>

        {isDiwaliEdit && <section className="collection-special collection-special--diwali" aria-labelledby="diwali-collection-title"><div className="collection-special-banner"><img src={fashionImage('photo-1610030469983-98e550d6193c')} alt="Festive Indian occasionwear in warm golden light" /><div><Eyebrow>THE FESTIVE SEASON, IN FULL LIGHT</Eyebrow><h2 id="diwali-collection-title">Dress up. Light up.<br /><em>Celebrate in style.</em></h2><p>Warm gold, jewel tones and the joy of getting together.</p></div></div><div className="collection-special-grid">{diwaliLooks.map((look) => <article key={look.name}><img src={fashionImage(look.image)} alt={look.name} loading="lazy" onError={(event) => { event.currentTarget.src = fashionImage('photo-1529139574466-a303027c1d8b') }} /><div><span>THE DIWALI EDIT</span><h3>{look.name}</h3><Link to={`/find-my-size?audience=${encodeURIComponent(look.audience)}&category=Traditional%20wear&clothingType=${encodeURIComponent(look.type)}`}>Explore fit <ArrowRight size={14} /></Link></div></article>)}</div></section>}

        {isLehengaStudio && <section className="collection-special collection-special--lehenga" aria-labelledby="lehenga-looks-title"><div className="collection-special-heading"><div><Eyebrow>SEVEN MOODS, ONE BETTER FIT</Eyebrow><h2 id="lehenga-looks-title">Find your <em>lehenga mood.</em></h2></div><p>Explore colour, silhouette and surface detail. Product imagery is editorial inspiration; confirm the actual fabric, construction and brand size chart before choosing.</p></div><div className="lehenga-look-grid">{lehengaLooks.map((look) => <article key={look.name}><img src={fashionImage(look.image)} alt={`${look.name} lehenga editorial`} loading="lazy" onError={(event) => { event.currentTarget.src = fashionImage('photo-1610030469983-98e550d6193c') }} /><div><span>THE LEHENGA STUDIO</span><h3>{look.name}</h3><p>{look.detail}</p></div></article>)}</div><Button to="/find-my-size?audience=Women&category=Traditional%20wear&clothingType=Lehenga%20choli" icon={ArrowRight}>Find your perfect lehenga fit</Button></section>}

        <section className="occasion-collections" aria-labelledby="occasion-collections-heading">
          <div className="occasion-collections-heading">
            <div><Eyebrow>DRESS FOR THE MOMENT, YOUR WAY</Eyebrow><h2 id="occasion-collections-heading">Collections for <em>every occasion.</em></h2></div>
            <p>These are starting points, not dress codes. Explore silhouettes across women’s and men’s collections, and choose what suits your traditions, comfort and personal style.</p>
          </div>
          <div className="occasion-collection-grid">
            {traditionalOccasions.map((item) => (
              <button
                className={occasion === item.name ? 'occasion-collection-card is-selected' : 'occasion-collection-card'}
                type="button"
                aria-pressed={occasion === item.name}
                onClick={() => { setOccasion((current) => current === item.name ? 'All occasions' : item.name); setClothingType('All clothing types') }}
                key={item.id}
              >
                <img src={item.image} alt={item.alt} loading="lazy" onError={(event) => { event.currentTarget.src = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=82' }} />
                <span className="occasion-collection-overlay" />
                <span className="occasion-collection-copy"><strong>{item.name}</strong><small>{item.description}</small><span>EXPLORE COLLECTION</span></span>
                {occasion === item.name && <span className="occasion-selected-indicator" aria-hidden="true"><ArrowRight size={15} /></span>}
              </button>
            ))}
          </div>
        </section>

        <section className="textile-discovery-section" aria-labelledby="textile-discovery-heading">
          <div className="textile-discovery-heading">
            <div><Eyebrow>FABRIC & REGIONAL FASHION</Eyebrow><h2 id="textile-discovery-heading">Textiles with <em>their own stories.</em></h2></div>
            <p>Explore materials, techniques and regional weaving traditions. Select one to discover categories that commonly feature it.</p>
          </div>
          <div className="textile-discovery-grid">
            {textileDiscoveries.map((textile) => (
              <article className={fabric === textile.name ? 'textile-discovery-card is-selected' : 'textile-discovery-card'} key={textile.id}>
                <div className="textile-discovery-image">
                  <img src={textile.image} alt={textile.alt} loading="lazy" onError={(event) => { event.currentTarget.src = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=82' }} />
                  <span>{textile.kind.toUpperCase()}</span>
                </div>
                <div className="textile-discovery-copy">
                  <span className="textile-region">{textile.region}</span>
                  <h3>{textile.name}</h3>
                  <p>{textile.description}</p>
                  <button type="button" aria-pressed={fabric === textile.name} onClick={() => setFabric((current) => current === textile.name ? 'All fabrics' : textile.name)}>
                    {fabric === textile.name ? 'Selected · clear' : 'Explore matching categories'} <ArrowRight size={13} />
                  </button>
                </div>
              </article>
            ))}
          </div>
          <aside className="textile-fit-note">
            <Eyebrow>WHY MATERIAL MATTERS</Eyebrow>
            <p>Fabric stretch, thickness, lining, weave and garment construction all affect how a piece feels and fits. A textile name alone cannot determine a size, so use the product’s relevant chart and fit details where available.</p>
          </aside>
          <p className="textile-regional-note">Regional origins describe associated textile traditions, not exclusive ownership. Cotton, linen, organza, georgette, chiffon and velvet are material types rather than single-region crafts.</p>
        </section>

        <section className="collections-browser" aria-labelledby="collections-heading">
          <div className="collections-browser-heading">
            <div>
              <Eyebrow>FIND YOUR CATEGORY</Eyebrow>
              <h2 id="collections-heading">A wardrobe of <em>possibilities.</em></h2>
            </div>
            <span className="collections-count">{filteredCategories.length} CATEGORIES{selectedOccasion ? ` · ${selectedOccasion.name.toUpperCase()}` : ''}</span>
          </div>

          <div className="collections-filters" aria-label="Filter traditional wear categories">
            <div className="collections-filter-label"><SlidersHorizontal size={16} /><span>REFINE</span></div>
            <label htmlFor="filter-audience">Shop for
              <select id="filter-audience" value={audience} onChange={handleAudienceChange}>
                {audienceOptions.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
            </label>
            <label htmlFor="filter-type">Clothing type
              <select id="filter-type" value={clothingType} onChange={(event) => setClothingType(event.target.value)}>
                {typeOptions.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
            </label>
            <label htmlFor="filter-occasion">Occasion
              <select id="filter-occasion" value={occasion} onChange={(event) => setOccasion(event.target.value)}>
                {occasionOptions.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
            </label>
            <label htmlFor="filter-fabric">Fabric
              <select id="filter-fabric" value={fabric} onChange={(event) => setFabric(event.target.value)}>
                {fabricOptions.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
            </label>
            <label htmlFor="filter-fit">Fit preference
              <select id="filter-fit" value={fit} onChange={(event) => setFit(event.target.value)}>
                {fitOptions.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
            </label>
          </div>

          {filteredCategories.length > 0 ? (
            <div className="traditional-category-grid" ref={categoryResultsRef}>
              {filteredCategories.map((item) => (
                <article className="traditional-category-card" key={item.id}>
                  <div className="traditional-category-image">
                    <img src={item.image} alt={item.alt} loading="lazy" onError={(event) => { event.currentTarget.src = 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=82' }} />
                    <span>{item.audience.toUpperCase()} · TRADITIONAL</span>
                  </div>
                  <div className="traditional-category-content">
                    <h3>{item.name}</h3>
                    <p>{item.description}</p>
                    <span className="traditional-product-label">SAMPLE STYLE</span>
                    <strong className="traditional-product-name">{item.productName}</strong>
                    <div className="traditional-category-meta">
                      <span>{item.occasions.slice(0, 2).join(' · ')}</span>
                      <span>{item.fabrics.slice(0, 2).join(' · ')}</span>
                    </div>
                    <Button to={`/find-my-size?audience=${encodeURIComponent(item.audience)}&category=Traditional%20wear&clothingType=${encodeURIComponent(item.name)}`} variant="secondary" size="small" icon={ArrowRight}>Explore sizing</Button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="collections-empty-state">
              <h3>No categories match those filters.</h3>
              <p>Try a different occasion, fabric or fit preference.</p>
              <button type="button" onClick={() => { setAudience('All'); setClothingType('All clothing types'); setOccasion('All occasions'); setFabric('All fabrics'); setFit('All fits') }}>Clear filters</button>
            </div>
          )}

          <p className="collections-demo-note">Category examples are illustrative. Product construction, finishing and brand sizing vary; use the Finder’s category-specific demo chart as a guide, not live brand data.</p>
        </section>

        <section className="collections-western-callout">
          <div><Eyebrow>ALSO IN THE FITMATE EDIT</Eyebrow><h2>Western essentials,<br /><em>same personal approach.</em></h2></div>
          <Button to="/find-my-size" variant="light" icon={ArrowRight}>Explore all sizing</Button>
        </section>
      </main>

      <footer className="collections-footer">
        <BrandWordmark to="/" />
        <nav aria-label="Collections footer navigation"><Link to="/">Home</Link><Link to="/about">About FITMATE</Link><Link to="/how-it-works">How It Works</Link><Link to="/find-my-size">Find My Size</Link></nav>
        <span>ONE BODY. EVERY BRAND. ONE PERFECT FIT.</span>
      </footer>
    </div>
  )
}

export default CollectionsPage
