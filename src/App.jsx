
import { useState } from "react";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  Settings,
  Search,
  Bell,
  TrendingUp,
  TrendingDown,
  Euro,
  AlertTriangle,
  Plus,
  ArrowUpRight,
} from "lucide-react";
import "./App.css";

function App() {
  const [activePage, setActivePage] = useState("Dashboard");

  const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard },
    { name: "Ventes", icon: ShoppingCart },
    { name: "Produits & Stock", icon: Package },
    { name: "Employés", icon: Users },
    { name: "Paramètres", icon: Settings },
  ];

  const stats = [
    {
      title: "Chiffre d'affaires",
      value: "24 580 €",
      change: "+12,8 %",
      icon: Euro,
      trend: "up",
    },
    {
      title: "Ventes totales",
      value: "384",
      change: "+8,2 %",
      icon: ShoppingCart,
      trend: "up",
    },
    {
      title: "Produits en stock",
      value: "1 248",
      change: "-3,4 %",
      icon: Package,
      trend: "down",
    },
    {
      title: "Employés",
      value: "24",
      change: "Équipe active",
      icon: Users,
      trend: "up",
    },
  ];

  const products = [
    {
      name: "iPhone 16",
      category: "Smartphones",
      price: "899 €",
      stock: 18,
      status: "Disponible",
    },
    {
      name: "Samsung Galaxy S25",
      category: "Smartphones",
      price: "849 €",
      stock: 12,
      status: "Disponible",
    },
    {
      name: "MacBook Air M4",
      category: "Ordinateurs",
      price: "1 199 €",
      stock: 4,
      status: "Stock faible",
    },
    {
      name: "Sony WH-1000XM5",
      category: "Audio",
      price: "299 €",
      stock: 0,
      status: "Épuisé",
    },
  ];

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">
            <ShoppingCart size={24} />
          </div>
          <div>
            <h1>StorePulse</h1>
            <span>STORE MANAGEMENT</span>
          </div>
        </div>

        <div className="menu-label">MENU PRINCIPAL</div>

        <nav className="navigation">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.name}
                className={
                  activePage === item.name
                    ? "nav-item active"
                    : "nav-item"
                }
                onClick={() => setActivePage(item.name)}
              >
                <Icon size={19} />
                <span>{item.name}</span>
                {item.name === "Produits & Stock" && (
                  <span className="nav-count">4</span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <div className="store-status">
            <span className="status-dot"></span>
            Système opérationnel
          </div>
          <p>StorePulse v1.0.0</p>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="search-box">
            <Search size={19} />
            <input placeholder="Rechercher..." />
            <kbd>⌘ K</kbd>
          </div>

          <div className="topbar-right">
            <button className="notification-button" aria-label="Notifications">
              <Bell size={20} />
              <span></span>
            </button>

            <div className="profile">
              <div className="profile-avatar">MM</div>
              <div className="profile-info">
                <strong>Manager</strong>
                <span>Administrateur</span>
              </div>
            </div>
          </div>
        </header>

        <div className="page-container">
          <section className="page-heading">
            <div>
              <div className="breadcrumb">Accueil / {activePage}</div>
              <h2>{activePage}</h2>
              <p>
                Voici un aperçu de l'activité de votre magasin.
              </p>
            </div>

            <button className="primary-button">
              <Plus size={18} />
              Nouvelle vente
            </button>
          </section>

          <section className="stats-grid">
            {stats.map((stat) => {
              const Icon = stat.icon;

              return (
                <article className="stat-card" key={stat.title}>
                  <div className="stat-top">
                    <div className="stat-icon">
                      <Icon size={21} />
                    </div>
                    <button className="more-button" aria-label="Options">
                      <ArrowUpRight size={18} />
                    </button>
                  </div>

                  <p className="stat-title">{stat.title}</p>
                  <h3>{stat.value}</h3>

                  <div
                    className={
                      stat.trend === "up"
                        ? "stat-change positive"
                        : "stat-change negative"
                    }
                  >
                    {stat.trend === "up" ? (
                      <TrendingUp size={15} />
                    ) : (
                      <TrendingDown size={15} />
                    )}
                    <span>{stat.change}</span>
                  </div>
                </article>
              );
            })}
          </section>

          <section className="content-grid">
            <article className="panel sales-panel">
              <div className="panel-heading">
                <div>
                  <h3>Évolution des ventes</h3>
                  <p>Performance de votre magasin</p>
                </div>

                <select defaultValue="7 jours" aria-label="Période">
                  <option>7 jours</option>
                  <option>30 jours</option>
                  <option>12 mois</option>
                </select>
              </div>

              <div className="chart-summary">
                <strong>24 580 €</strong>
                <span>
                  <TrendingUp size={15} /> +12,8 %
                </span>
              </div>

              <div className="chart-container">
                <div className="chart-y-labels">
                  <span>8k €</span>
                  <span>6k €</span>
                  <span>4k €</span>
                  <span>2k €</span>
                  <span>0 €</span>
                </div>

                <div className="chart-area">
                  <div className="chart-grid-lines">
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>

                  <svg
                    className="sales-chart"
                    viewBox="0 0 600 210"
                    preserveAspectRatio="none"
                    role="img"
                    aria-label="Graphique illustratif des ventes sur sept jours"
                  >
                    <defs>
                      <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#d71920" stopOpacity="0.22" />
                        <stop offset="100%" stopColor="#d71920" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M0,160 C35,150 50,125 85,140 S140,100 170,120 S220,75 255,100 S305,125 340,80 S395,90 425,65 S480,90 510,45 S560,60 600,20 L600,210 L0,210 Z"
                      fill="url(#salesFill)"
                    />
                    <path
                      d="M0,160 C35,150 50,125 85,140 S140,100 170,120 S220,75 255,100 S305,125 340,80 S395,90 425,65 S480,90 510,45 S560,60 600,20"
                      fill="none"
                      stroke="#d71920"
                      strokeWidth="3"
                      vectorEffect="non-scaling-stroke"
                    />
                  </svg>
                </div>
              </div>

              <div className="chart-x-labels">
                <span>Lun.</span>
                <span>Mar.</span>
                <span>Mer.</span>
                <span>Jeu.</span>
                <span>Ven.</span>
                <span>Sam.</span>
                <span>Dim.</span>
              </div>
            </article>

            <article className="panel stock-panel">
              <div className="panel-heading">
                <div>
                  <h3>État du stock</h3>
                  <p>Disponibilité des produits</p>
                </div>
                <Package size={21} className="muted-icon" />
              </div>

              <div className="stock-total">
                <strong>1 248</strong>
                <span>unités en stock</span>
              </div>

              <div className="stock-bar">
                <span className="stock-available"></span>
                <span className="stock-low"></span>
                <span className="stock-out"></span>
              </div>

              <div className="stock-legend">
                <div>
                  <span className="legend-dot available"></span>
                  <span>Disponible</span>
                  <strong>82%</strong>
                </div>
                <div>
                  <span className="legend-dot low"></span>
                  <span>Stock faible</span>
                  <strong>13%</strong>
                </div>
                <div>
                  <span className="legend-dot out"></span>
                  <span>Épuisé</span>
                  <strong>5%</strong>
                </div>
              </div>

              <button
                className="secondary-button"
                onClick={() => setActivePage("Produits & Stock")}
              >
                Gérer le stock
              </button>
            </article>
          </section>

          <section className="panel products-panel">
            <div className="panel-heading">
              <div>
                <h3>Produits récents</h3>
                <p>Aperçu des produits du magasin</p>
              </div>

              <button
                className="text-button"
                onClick={() => setActivePage("Produits & Stock")}
              >
                Voir tous les produits
                <ArrowUpRight size={17} />
              </button>
            </div>

            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Produit</th>
                    <th>Catégorie</th>
                    <th>Prix</th>
                    <th>Quantité</th>
                    <th>Statut</th>
                  </tr>
                </thead>

                <tbody>
                  {products.map((product) => (
                    <tr key={product.name}>
                      <td>
                        <div className="product-name">
                          <div className="product-placeholder">
                            <Package size={19} />
                          </div>
                          <strong>{product.name}</strong>
                        </div>
                      </td>
                      <td>{product.category}</td>
                      <td className="price-cell">{product.price}</td>
                      <td>{product.stock}</td>
                      <td>
                        <span
                          className={`product-status ${
                            product.status === "Disponible"
                              ? "status-available"
                              : product.status === "Stock faible"
                                ? "status-low"
                                : "status-out"
                          }`}
                        >
                          {product.status === "Disponible" && (
                            <span className="status-dot"></span>
                          )}
                          {product.status === "Stock faible" && (
                            <AlertTriangle size={13} />
                          )}
                          {product.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <footer className="page-footer">
            <span>© 2026 StorePulse</span>
            <span>Projet de gestion de magasin · Données fictives</span>
          </footer>
        </div>
      </main>
    </div>
  );
}

export default App;
