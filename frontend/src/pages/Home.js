import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link, useLocation } from "react-router-dom";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://vercel-backend-zeta-green.vercel.app"
    : "http://localhost:5000");

function Home() {
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [nearbyShops, setNearbyShops] = useState([]);
  const [locationCity, setLocationCity] = useState("San Francisco, CA");
  const [makersSearch, setMakersSearch] = useState("");
  const [shopSearch, setShopSearch] = useState("");
  const [selectedCraft, setSelectedCraft] = useState("");
  const [loading, setLoading] = useState(true);

  const activeView = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const view = params.get("view") || "shop";
    if (["shop", "deals", "makers", "stories"].includes(view)) {
      return view;
    }
    return "shop";
  }, [location.search]);

  const getPlaceholderImage = (label) => {
    const safeLabel = (label || "Product").toString().trim().slice(0, 16);
    const text = safeLabel.length > 0 ? safeLabel : "Product";
    const svg =
      '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480">' +
      '<rect width="100%" height="100%" fill="#e8dfd7"/>' +
      '<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#7c6452" font-family="Arial" font-size="28">' +
      text +
      "</text></svg>";
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  };

  const getProductImage = (product) => {
    const image = product?.imageUrl || product?.image;
    if (image && image.trim()) {
      return image;
    }
    return getPlaceholderImage(product?.name || product?.category);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const city = localStorage.getItem("qb_location_city") || "San Francisco, CA";
        setLocationCity(city);

        const [productsRes, shopsRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/products`),
          axios
            .get(`${API_BASE_URL}/api/shops?city=${encodeURIComponent(city)}`)
            .catch(() => ({ data: [] })),
        ]);

        setProducts(productsRes.data || []);
        setNearbyShops(shopsRes.data || []);
      } catch (error) {
        console.error("Home data load error:", error);
        setProducts([]);
        setNearbyShops([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const categories = useMemo(() => {
    const categoryMap = new Map();

    products.forEach((product) => {
      const name = product.category || "General";
      const key = name.toLowerCase();
      const existing = categoryMap.get(key);

      if (!existing) {
        categoryMap.set(key, {
          key,
          name,
          count: 1,
          sample: product,
        });
      } else {
        existing.count += 1;
      }
    });

    return Array.from(categoryMap.values()).sort((a, b) => b.count - a.count);
  }, [products]);

  const filteredCategories = useMemo(() => {
    if (!makersSearch.trim()) {
      return categories;
    }

    return categories.filter((category) =>
      category.name.toLowerCase().includes(makersSearch.toLowerCase()),
    );
  }, [categories, makersSearch]);

  const topMakerCards = filteredCategories.slice(0, 5);
  const makerMiniCards = filteredCategories.slice(5, 8);

  const shopCraftItems = categories.slice(0, 6);
  const shopFilteredProducts = useMemo(() => {
    let list = [...products];

    if (selectedCraft) {
      list = list.filter(
        (product) =>
          (product.category || "").toLowerCase() === selectedCraft.toLowerCase(),
      );
    }

    if (shopSearch.trim()) {
      const term = shopSearch.toLowerCase();
      list = list.filter((product) => {
        const text = `${product.name || ""} ${product.category || ""} ${
          product.shop?.name || ""
        }`.toLowerCase();
        return text.includes(term);
      });
    }

    return list;
  }, [products, selectedCraft, shopSearch]);

  const artisanPicks = shopFilteredProducts.slice(0, 3);

  const shopMakers = useMemo(() => {
    if (nearbyShops.length > 0) {
      return nearbyShops.slice(0, 3);
    }

    const unique = new Map();
    products.forEach((product) => {
      const shop = product.shop;
      if (!shop) return;

      const key = shop._id || shop.name;
      if (!unique.has(key)) {
        unique.set(key, {
          _id: key,
          name: shop.name || "Local Maker",
          city: shop.city || locationCity,
        });
      }
    });

    return Array.from(unique.values()).slice(0, 3);
  }, [nearbyShops, products, locationCity]);

  const getShopHeroByMaker = (maker, fallbackIndex = 0) => {
    const match = products.find((item) => {
      const itemShop = item.shop;
      if (!itemShop) return false;
      if (maker._id && itemShop._id) {
        return itemShop._id === maker._id;
      }
      return itemShop.name === maker.name;
    });

    return match || products[fallbackIndex] || {};
  };

  const flashMain = products[0];
  const flashSide = products.slice(1, 3);
  const morningSpecials = products.slice(3, 7);

  const newMakerCards = nearbyShops.slice(0, 2).map((shop, index) => {
    const productSample = products.find((item) => item.shop?._id === shop._id);
    const fallback = products[index + 2];
    return {
      ...shop,
      sampleImage: getProductImage(productSample || fallback || {}),
      offerText: index === 0 ? "25% OFF" : "$12.00 / bag",
      actionText: index === 0 ? "View Collection" : "Shop Coffee",
    };
  });

  const marketFooter = (
    <footer className="qb-market-footer">
      <div>
        <h4>The Artisanal Marketplace</h4>
        <p>Connecting local makers with modern buyers who value heritage and quality.</p>
      </div>
      <div>
        <h5>Marketplace</h5>
        <a href="/?view=shop">Shop All</a>
        <a href="/?view=deals">Local Deals</a>
        <a href="/?view=makers">Makers</a>
      </div>
      <div>
        <h5>Support</h5>
        <a href="#0">Shipping & Returns</a>
        <a href="#0">Contact Us</a>
        <a href="#0">Privacy Policy</a>
      </div>
      <div>
        <h5>Newsletter</h5>
        <div className="qb-market-footer-input">
          <input placeholder="Email" type="email" />
          <button type="button">Go</button>
        </div>
      </div>
    </footer>
  );

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading handcrafted collections...</div>
      </div>
    );
  }

  if (activeView === "shop") {
    return (
      <div className="qb-dashboard fade-in" id="shop-section">
        <section className="qb-hero">
          <div className="qb-hero-overlay" />
          <div className="qb-hero-content">
            <h1>
              Your Neighborhood,
              <span>Delivered.</span>
            </h1>
            <p>
              The finest local products from your community artisans, farmers,
              and bakers, brought straight to your door.
            </p>

            <form
              className="qb-hero-search"
              onSubmit={(event) => {
                event.preventDefault();
              }}
            >
              <input
                type="text"
                placeholder="Search handcrafted products"
                value={shopSearch}
                onChange={(event) => setShopSearch(event.target.value)}
              />

              <select
                value={locationCity}
                onChange={(event) => {
                  setLocationCity(event.target.value);
                  localStorage.setItem("qb_location_city", event.target.value);
                }}
              >
                <option value="San Francisco, CA">San Francisco, CA</option>
                <option value="Oakland, CA">Oakland, CA</option>
                <option value="San Jose, CA">San Jose, CA</option>
              </select>

              <button type="submit">Search</button>
            </form>
          </div>
        </section>

        <section className="qb-section" id="categories-section">
          <div className="qb-section-header">
            <h2>Browse by Craft</h2>
            <p>Curated essentials from local makers.</p>
          </div>

          <div className="qb-craft-row">
            {shopCraftItems.map((item) => (
              <button
                key={item.key}
                className={`qb-craft-item ${selectedCraft === item.name ? "active" : ""}`}
                onClick={() =>
                  setSelectedCraft(selectedCraft === item.name ? "" : item.name)
                }
                type="button"
              >
                <img
                  src={getProductImage(item.sample)}
                  alt={item.name}
                  onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src = getPlaceholderImage(item.name);
                  }}
                />
                <span>{item.name}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="qb-section" id="local-deals-section">
          <div className="qb-section-title-row">
            <h2>Artisan Picks</h2>
            <span>{shopFilteredProducts.length} products</span>
          </div>

          {artisanPicks.length === 0 ? (
            <div className="empty-state">
              <h3>No products found</h3>
              <p>Try changing your search or category.</p>
            </div>
          ) : (
            <div className="qb-product-grid">
              {artisanPicks.map((product) => (
                <article key={product._id} className="qb-product-card">
                  <Link to={`/product/${product._id}`}>
                    <img
                      src={getProductImage(product)}
                      alt={product.name}
                      onError={(event) => {
                        event.currentTarget.onerror = null;
                        event.currentTarget.src = getPlaceholderImage(product.name);
                      }}
                    />
                  </Link>
                  <div className="qb-product-body">
                    <small>{product.shop?.name || "Local Maker"}</small>
                    <h3>{product.name}</h3>
                    <div className="qb-product-foot">
                      <strong>${Number(product.price || 0).toFixed(2)}</strong>
                      <Link to={`/product/${product._id}`} className="qb-pill-btn">
                        Add to Cart
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="qb-section" id="makers-section">
          <div className="qb-makers-header">
            <h2>Meet Your Makers</h2>
            <p>Discover the shops and artisans that make your neighborhood unique.</p>
          </div>

          <div className="qb-makers-grid">
            {shopMakers.map((maker, index) => {
              const showcase = getShopHeroByMaker(maker, index);
              return (
                <article key={maker._id || maker.name} className="qb-maker-card">
                  <img
                    src={getProductImage(showcase)}
                    alt={maker.name}
                    onError={(event) => {
                      event.currentTarget.onerror = null;
                      event.currentTarget.src = getPlaceholderImage(maker.name);
                    }}
                  />
                  <div className="qb-maker-overlay">
                    <h3>{maker.name}</h3>
                    <p>{maker.city || locationCity}</p>
                    <span>{maker.distanceKm ? `${maker.distanceKm} mi` : "Nearby"}</span>
                  </div>
                  <div className="qb-maker-rating">
                    <span>{(4.8 + index * 0.1).toFixed(1)}</span>
                    <small>{`${40 + index * 20}+ reviews`}</small>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <footer className="qb-footer">
          <div>
            <h4>QuickBazaar</h4>
            <p>Connecting neighborhoods to local artisans since 2023.</p>
          </div>
          <div>
            <h5>Shop</h5>
            <a href="#categories-section">Categories</a>
            <a href="/?view=deals">Local Deals</a>
            <a href="#0">Gift Cards</a>
          </div>
          <div>
            <h5>Partner</h5>
            <a href="/admin/register">Sell on Bazaar</a>
            <a href="#0">Delivery Partner</a>
            <a href="/admin/login">Merchant Hub</a>
          </div>
          <div>
            <h5>Support</h5>
            <a href="#0">About Us</a>
            <a href="#0">Privacy Policy</a>
            <a href="#0">Terms of Service</a>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="qb-market-wrap">
      {activeView === "makers" && (
        <>
          <section className="qb-makers-screen">
            <div className="qb-makers-heading">
              <small>Curated Collections</small>
              <h1>
                Browse by <span>Category</span>
              </h1>
              <p>
                Discover local mastery through our handpicked selections of artisanal goods,
                from the soil to the studio.
              </p>
            </div>

            <div className="qb-makers-search">
              <input
                type="text"
                placeholder="Search categories..."
                value={makersSearch}
                onChange={(event) => setMakersSearch(event.target.value)}
              />
            </div>

            {topMakerCards.length === 0 ? (
              <div className="empty-state">
                <h3>No matching categories</h3>
                <p>Try another search term.</p>
              </div>
            ) : (
              <div className="qb-makers-grid-new">
                {topMakerCards.map((category, index) => (
                  <article
                    key={category.key}
                    className={`qb-makers-card qb-makers-card-${index + 1}`}
                  >
                    <img
                      src={getProductImage(category.sample)}
                      alt={category.name}
                      onError={(event) => {
                        event.currentTarget.onerror = null;
                        event.currentTarget.src = getPlaceholderImage(category.name);
                      }}
                    />
                    <div className="qb-makers-card-overlay">
                      <h3>{category.name}</h3>
                      <p>{category.count} products</p>
                    </div>
                  </article>
                ))}
              </div>
            )}

            <div className="qb-makers-mini-row">
              {makerMiniCards.map((card) => (
                <article key={card.key}>
                  <h4>{card.name}</h4>
                  <p>{card.count} makers</p>
                </article>
              ))}
              <article className="qb-makers-mini-highlight">
                <h4>View All Makers</h4>
                <p>Join the community</p>
              </article>
            </div>
          </section>
          {marketFooter}
        </>
      )}

      {(activeView === "deals" || activeView === "stories") && (
        <>
          <section className="qb-deals-hero">
            <span>Flash Sales Active</span>
            <h1>
              Local Treasures,
              <br />
              <em>Limited Moments.</em>
            </h1>
            <p>
              Discover exclusive, time-sensitive offers from our community of makers.
              Handcrafted quality meet exceptional value.
            </p>
            <Link to="/?view=deals" className="qb-deals-hero-btn">
              Explore All Offers
            </Link>
          </section>

          <section className="qb-market-section">
            <div className="qb-market-title-row">
              <div>
                <h2>Flash Sales</h2>
                <p>Ending in less than 4 hours</p>
              </div>
              <a href="/?view=deals">View All</a>
            </div>

            <div className="qb-flash-layout">
              {flashMain ? (
                <article className="qb-flash-main">
                  <img
                    src={getProductImage(flashMain)}
                    alt={flashMain.name}
                    onError={(event) => {
                      event.currentTarget.onerror = null;
                      event.currentTarget.src = getPlaceholderImage(flashMain.name);
                    }}
                  />
                  <div className="qb-flash-main-overlay">
                    <h3>{flashMain.name}</h3>
                    <p>{flashMain.description || "Premium handcrafted product"}</p>
                    <strong>${Number(flashMain.price || 0).toFixed(2)}</strong>
                  </div>
                </article>
              ) : null}

              <div className="qb-flash-side">
                {flashSide.map((item) => (
                  <article key={item._id} className="qb-flash-side-card">
                    <img
                      src={getProductImage(item)}
                      alt={item.name}
                      onError={(event) => {
                        event.currentTarget.onerror = null;
                        event.currentTarget.src = getPlaceholderImage(item.name);
                      }}
                    />
                    <div>
                      <h4>{item.name}</h4>
                      <strong>${Number(item.price || 0).toFixed(2)}</strong>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section className="qb-market-section">
            <div className="qb-market-title-row">
              <div>
                <h2>Baker&apos;s Morning Specials</h2>
                <p>Freshly baked from the oven. Best deals disappear fast.</p>
              </div>
              <span className="qb-market-chip">Bundle &amp; Save</span>
            </div>

            <div className="qb-morning-grid">
              {morningSpecials.map((item) => (
                <article key={item._id} className="qb-morning-card">
                  <img
                    src={getProductImage(item)}
                    alt={item.name}
                    onError={(event) => {
                      event.currentTarget.onerror = null;
                      event.currentTarget.src = getPlaceholderImage(item.name);
                    }}
                  />
                  <h4>{item.name}</h4>
                  <p>{item.category || "Seasonal"}</p>
                  <div>
                    <strong>${Number(item.price || 0).toFixed(2)}</strong>
                    <Link to={`/product/${item._id}`}>+</Link>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="qb-market-section">
            <h2 className="qb-center-title">New Maker Introductions</h2>
            <div className="qb-new-maker-grid">
              {newMakerCards.map((maker) => (
                <article key={maker._id} className="qb-new-maker-card">
                  <img
                    src={maker.sampleImage}
                    alt={maker.name}
                    onError={(event) => {
                      event.currentTarget.onerror = null;
                      event.currentTarget.src = getPlaceholderImage(maker.name);
                    }}
                  />
                  <div>
                    <small>New Partner</small>
                    <h4>{maker.name}</h4>
                    <p>{maker.city || locationCity}</p>
                    <strong>{maker.offerText}</strong>
                    <button type="button">{maker.actionText}</button>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="qb-market-newsletter">
            <h2>Never miss a local treasure.</h2>
            <p>Get instant notifications when your favorite makers drop new limited-time deals.</p>
            <div>
              <input type="email" placeholder="Enter your email" />
              <button type="button">Join Member Deals</button>
            </div>
          </section>

          {marketFooter}
        </>
      )}
    </div>
  );
}

export default Home;
