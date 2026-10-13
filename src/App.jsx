
import { useEffect, useMemo, useState } from "react";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  Settings,
  Search,
  Bell,
  TrendingUp,
  Euro,
  AlertTriangle,
  Plus,
  ArrowUpRight,
  Pencil,
  Trash2,
  X,
  RefreshCw,
  Filter,
  LoaderCircle,
} from "lucide-react";
import "./App.css";

const API_URL = "http://localhost:5080/api";

const emptyForm = {
  reference: "",
  name: "",
  category: "",
  brand: "",
  description: "",
  price: "",
  quantity: "0",
  minimumStock: "5",
};

function getStockStatus(product) {
  if (product.quantity === 0) {
    return { label: "Épuisé", className: "status-out" };
  }

  if (product.quantity <= product.minimumStock) {
    return { label: "Stock faible", className: "status-low" };
  }

  return { label: "Disponible", className: "status-available" };
}

function formatPrice(price) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(Number(price || 0));
}

function App() {
  const [activePage, setActivePage] = useState("Dashboard");
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [stockStatus, setStockStatus] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const [notice, setNotice] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      setLoading(true);
      setError("");

      try {
        const params = new URLSearchParams();

        if (search.trim()) params.set("search", search.trim());
        if (category) params.set("category", category);
        if (stockStatus) params.set("stockStatus", stockStatus);
        if (minPrice !== "") params.set("minPrice", minPrice);
        if (maxPrice !== "") params.set("maxPrice", maxPrice);

        const query = params.toString();
        const response = await fetch(
          `${API_URL}/products${query ? `?${query}` : ""}`
        );

        if (!response.ok) {
          throw new Error("Impossible de récupérer les produits.");
        }

        const data = await response.json();

        if (!cancelled) {
          setProducts(data);
        }
      } catch {
        if (!cancelled) {
          setError(
            "Connexion impossible. Vérifiez que l'API StorePulse fonctionne sur le port 5080."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadProducts();

    return () => {
      cancelled = true;
    };
  }, [search, category, stockStatus, minPrice, maxPrice, refreshKey]);

  useEffect(() => {
    async function loadCategories() {
      try {
        const response = await fetch(`${API_URL}/products/categories`);
        if (!response.ok) return;

        const data = await response.json();
        setCategories(data);
      } catch {
        // Les catégories seront rechargées après une opération produit.
      }
    }

    loadCategories();
  }, [refreshKey]);

  const stats = useMemo(() => {
    const totalUnits = products.reduce(
      (total, product) => total + product.quantity,
      0
    );

    const lowStock = products.filter(
      (product) =>
        product.quantity > 0 &&
        product.quantity <= product.minimumStock
    ).length;

    const outOfStock = products.filter(
      (product) => product.quantity === 0
    ).length;

    return { totalUnits, lowStock, outOfStock };
  }, [products]);

  function openAddModal() {
    setEditingProduct(null);
    setForm(emptyForm);
    setFormError("");
    setModalOpen(true);
  }

  function openEditModal(product) {
    setEditingProduct(product);
    setForm({
      reference: product.reference ?? "",
      name: product.name ?? "",
      category: product.category ?? "",
      brand: product.brand ?? "",
      description: product.description ?? "",
      price: String(product.price ?? ""),
      quantity: String(product.quantity ?? 0),
      minimumStock: String(product.minimumStock ?? 5),
    });
    setFormError("");
    setModalOpen(true);
  }

  function updateForm(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError("");
    setNotice("");

    const price = Number(form.price);
    const quantity = Number(form.quantity);
    const minimumStock = Number(form.minimumStock);

    if (
      !form.reference.trim() ||
      !form.name.trim() ||
      !form.category.trim()
    ) {
      setFormError("Référence, nom et catégorie sont obligatoires.");
      return;
    }

    if (
      form.price === "" ||
      !Number.isFinite(price) ||
      price < 0 ||
      !Number.isInteger(quantity) ||
      quantity < 0 ||
      !Number.isInteger(minimumStock) ||
      minimumStock < 0
    ) {
      setFormError("Vérifiez le prix et les quantités saisies.");
      return;
    }

    const payload = {
      reference: form.reference.trim(),
      name: form.name.trim(),
      category: form.category.trim(),
      brand: form.brand.trim() || null,
      description: form.description.trim() || null,
      price,
      quantity,
      minimumStock,
    };

    setSaving(true);

    try {
      const isEditing = Boolean(editingProduct);
      const url = isEditing
        ? `${API_URL}/products/${editingProduct.id}`
        : `${API_URL}/products`;

      const response = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let message = "Une erreur est survenue.";
        try {
          const result = await response.json();
          message = result.message || message;
        } catch {
          // Garder le message par défaut.
        }
        throw new Error(message);
      }

      setModalOpen(false);
      setNotice(
        isEditing
          ? "Produit modifié avec succès."
          : "Produit ajouté avec succès."
      );
      setRefreshKey((key) => key + 1);
    } catch (err) {
      setFormError(
        err.message || "Impossible de contacter le serveur."
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteProduct(product) {
    const confirmed = window.confirm(
      `Voulez-vous vraiment supprimer « ${product.name} » ?`
    );

    if (!confirmed) return;

    setNotice("");
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/products/${product.id}`,
        { method: "DELETE" }
      );

      if (!response.ok) {
        let message = "Impossible de supprimer ce produit.";
        try {
          const result = await response.json();
          message = result.message || message;
        } catch {
          // Garder le message par défaut.
        }
        throw new Error(message);
      }

      setNotice("Produit supprimé avec succès.");
      setRefreshKey((key) => key + 1);
    } catch (err) {
      setError(err.message || "Erreur lors de la suppression.");
    }
  }

  const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard },
    { name: "Ventes", icon: ShoppingCart },
    { name: "Produits & Stock", icon: Package },
    { name: "Employés", icon: Users },
    { name: "Paramètres", icon: Settings },
  ];

  const isProductsPage = activePage === "Produits & Stock";

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
                  <span className="nav-count">{products.length}</span>
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
            <input
              placeholder="Rechercher un produit..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Rechercher un produit"
            />
            {search && (
              <button
                className="icon-button"
                onClick={() => setSearch("")}
                aria-label="Effacer la recherche"
              >
                <X size={15} />
              </button>
            )}
          </div>

          <div className="topbar-right">
            <button
              className="notification-button"
              aria-label="Notifications"
              title={`${stats.lowStock} produit(s) en stock faible, ${stats.outOfStock} épuisé(s)`}
              onClick={() => {
                setActivePage("Produits & Stock");
                setStockStatus("low");
              }}
            >
              <Bell size={20} />
              {(stats.lowStock > 0 || stats.outOfStock > 0) && <span />}
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
                {isProductsPage
                  ? "Consultez et gérez les produits de votre magasin."
                  : activePage === "Dashboard"
                    ? "Aperçu des données disponibles dans votre magasin."
                    : `Espace ${activePage.toLowerCase()}.`}
              </p>
            </div>

            {isProductsPage && (
              <button className="primary-button" onClick={openAddModal}>
                <Plus size={18} />
                Ajouter un produit
              </button>
            )}
          </section>

          {notice && (
            <div className="notice-message" role="status">
              <span>{notice}</span>
              <button onClick={() => setNotice("")} aria-label="Fermer">
                <X size={16} />
              </button>
            </div>
          )}

          {error && (
            <div className="error-message" role="alert">
              <AlertTriangle size={18} />
              <span>{error}</span>
              <button
                className="secondary-button retry-button"
                onClick={() => setRefreshKey((key) => key + 1)}
              >
                <RefreshCw size={15} /> Réessayer
              </button>
            </div>
          )}

          {activePage === "Dashboard" && (
            <>
              <section className="stats-grid">
                <article className="stat-card">
                  <div className="stat-top">
                    <div className="stat-icon"><Euro size={21} /></div>
                  </div>
                  <p className="stat-title">Chiffre d'affaires</p>
                  <h3>Non disponible</h3>
                  <div className="stat-change">
                    <span>Module ventes à connecter</span>
                  </div>
                </article>

                <article className="stat-card">
                  <div className="stat-top">
                    <div className="stat-icon"><ShoppingCart size={21} /></div>
                  </div>
                  <p className="stat-title">Ventes totales</p>
                  <h3>Non disponible</h3>
                  <div className="stat-change">
                    <span>Aucune donnée de vente connectée</span>
                  </div>
                </article>

                <article className="stat-card">
                  <div className="stat-top">
                    <div className="stat-icon"><Package size={21} /></div>
                  </div>
                  <p className="stat-title">Unités en stock</p>
                  <h3>{stats.totalUnits.toLocaleString("fr-FR")}</h3>
                  <div className="stat-change">
                    <span>{products.length} référence(s) dans le résultat actuel</span>
                  </div>
                </article>

                <article className="stat-card">
                  <div className="stat-top">
                    <div className="stat-icon"><AlertTriangle size={21} /></div>
                  </div>
                  <p className="stat-title">Alertes de stock</p>
                  <h3>{stats.lowStock + stats.outOfStock}</h3>
                  <div className="stat-change">
                    <span>{stats.lowStock} faible(s), {stats.outOfStock} épuisé(s)</span>
                  </div>
                </article>
              </section>

              <section className="content-grid">
                <article className="panel sales-panel">
                  <div className="panel-heading">
                    <div>
                      <h3>Activité des ventes</h3>
                      <p>Les statistiques apparaîtront après connexion du module ventes.</p>
                    </div>
                  </div>
                  <div className="empty-state">
                    <ShoppingCart size={32} />
                    <strong>Aucune donnée de vente connectée</strong>
                    <span>
                      Les chiffres et graphiques seront calculés à partir des
                      ventes enregistrées dans la base de données.
                    </span>
                  </div>
                </article>

                <article className="panel stock-panel">
                  <div className="panel-heading">
                    <div>
                      <h3>État du stock</h3>
                      <p>Selon les produits chargés</p>
                    </div>
                    <Package size={21} className="muted-icon" />
                  </div>

                  <div className="stock-total">
                    <strong>{stats.totalUnits.toLocaleString("fr-FR")}</strong>
                    <span>unités en stock</span>
                  </div>

                  <div className="stock-bar">
                    <span
                      className="stock-available"
                      style={{
                        width: `${products.length ? (products.filter((p) => p.quantity > p.minimumStock).length / products.length) * 100 : 0}%`,
                      }}
                    />
                    <span
                      className="stock-low"
                      style={{
                        width: `${products.length ? (stats.lowStock / products.length) * 100 : 0}%`,
                      }}
                    />
                    <span
                      className="stock-out"
                      style={{
                        flex: products.length ? stats.outOfStock / products.length : 1,
                      }}
                    />
                  </div>

                  <div className="stock-legend">
                    <div>
                      <span className="legend-dot available"></span>
                      <span>Disponible</span>
                      <strong>
                        {products.filter((p) => p.quantity > p.minimumStock).length}
                      </strong>
                    </div>
                    <div>
                      <span className="legend-dot low"></span>
                      <span>Stock faible</span>
                      <strong>{stats.lowStock}</strong>
                    </div>
                    <div>
                      <span className="legend-dot out"></span>
                      <span>Épuisé</span>
                      <strong>{stats.outOfStock}</strong>
                    </div>
                  </div>

                  <button
                    className="secondary-button"
                    onClick={() => {
                      setActivePage("Produits & Stock");
                      setStockStatus("");
                    }}
                  >
                    Gérer le stock
                  </button>
                </article>
              </section>

              <section className="panel products-panel">
                <div className="panel-heading">
                  <div>
                    <h3>Produits récents</h3>
                    <p>Données récupérées depuis MySQL</p>
                  </div>
                  <button
                    className="text-button"
                    onClick={() => setActivePage("Produits & Stock")}
                  >
                    Voir tous les produits <ArrowUpRight size={17} />
                  </button>
                </div>

                <ProductTable
                  products={products.slice(0, 5)}
                  loading={loading}
                  onEdit={openEditModal}
                  onDelete={deleteProduct}
                />
              </section>
            </>
          )}

          {isProductsPage && (
            <>
              <section className="stats-grid product-stats-grid">
                <article className="stat-card">
                  <div className="stat-top">
                    <div className="stat-icon"><Package size={21} /></div>
                  </div>
                  <p className="stat-title">Produits trouvés</p>
                  <h3>{products.length}</h3>
                </article>
                <article className="stat-card">
                  <div className="stat-top">
                    <div className="stat-icon"><TrendingUp size={21} /></div>
                  </div>
                  <p className="stat-title">Unités en stock</p>
                  <h3>{stats.totalUnits.toLocaleString("fr-FR")}</h3>
                </article>
                <article className="stat-card">
                  <div className="stat-top">
                    <div className="stat-icon"><AlertTriangle size={21} /></div>
                  </div>
                  <p className="stat-title">Stock faible</p>
                  <h3>{stats.lowStock}</h3>
                </article>
                <article className="stat-card">
                  <div className="stat-top">
                    <div className="stat-icon"><X size={21} /></div>
                  </div>
                  <p className="stat-title">Épuisés</p>
                  <h3>{stats.outOfStock}</h3>
                </article>
              </section>

              <section className="panel products-panel">
                <div className="panel-heading">
                  <div>
                    <h3>Liste des produits</h3>
                    <p>Recherche et filtres appliqués aux données MySQL</p>
                  </div>
                  <button
                    className="secondary-button refresh-button"
                    onClick={() => setRefreshKey((key) => key + 1)}
                    disabled={loading}
                  >
                    <RefreshCw size={15} /> Actualiser
                  </button>
                </div>

                <div className="filters-bar">
                  <label className="filter-field">
                    <span><Filter size={14} /> Catégorie</span>
                    <select
                      value={category}
                      onChange={(event) => setCategory(event.target.value)}
                    >
                      <option value="">Toutes les catégories</option>
                      {categories.map((item) => (
                        <option key={item} value={item}>{item}</option>
                      ))}
                    </select>
                  </label>

                  <label className="filter-field">
                    <span>État du stock</span>
                    <select
                      value={stockStatus}
                      onChange={(event) => setStockStatus(event.target.value)}
                    >
                      <option value="">Tous les états</option>
                      <option value="in">Disponible</option>
                      <option value="low">Stock faible</option>
                      <option value="out">Épuisé</option>
                    </select>
                  </label>

                  <label className="filter-field">
                    <span>Prix minimum (€)</span>
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={minPrice}
                      onChange={(event) => setMinPrice(event.target.value)}
                    />
                  </label>

                  <label className="filter-field">
                    <span>Prix maximum (€)</span>
                    <input
                      type="number"
                      min="0"
                      placeholder="Sans limite"
                      value={maxPrice}
                      onChange={(event) => setMaxPrice(event.target.value)}
                    />
                  </label>

                  <button
                    className="clear-filters-button"
                    onClick={() => {
                      setSearch("");
                      setCategory("");
                      setStockStatus("");
                      setMinPrice("");
                      setMaxPrice("");
                    }}
                  >
                    Effacer les filtres
                  </button>
                </div>

                {minPrice !== "" && maxPrice !== "" &&
                  Number(minPrice) > Number(maxPrice) && (
                    <p className="form-error">
                      Le prix minimum ne peut pas dépasser le prix maximum.
                    </p>
                  )}

                <ProductTable
                  products={products}
                  loading={loading}
                  onEdit={openEditModal}
                  onDelete={deleteProduct}
                />
              </section>
            </>
          )}

          {!["Dashboard", "Produits & Stock"].includes(activePage) && (
            <section className="panel module-placeholder">
              <div className="empty-state">
                {activePage === "Ventes" ? (
                  <ShoppingCart size={32} />
                ) : activePage === "Employés" ? (
                  <Users size={32} />
                ) : (
                  <Settings size={32} />
                )}
                <strong>Module en cours de développement</strong>
                <span>
                  {activePage === "Ventes"
                    ? "La gestion des ventes nécessite une table de ventes dans la base de données."
                    : activePage === "Employés"
                      ? "La gestion des employés sera ajoutée dans une prochaine étape."
                      : "Les paramètres seront configurés dans une prochaine étape."}
                </span>
                {activePage === "Ventes" && (
                  <button
                    className="secondary-button"
                    onClick={() => setActivePage("Produits & Stock")}
                  >
                    Consulter les produits
                  </button>
                )}
              </div>
            </section>
          )}

          <footer className="page-footer">
            <span>© 2026 StorePulse</span>
            <span>Gestion de magasin</span>
          </footer>
        </div>
      </main>

      {modalOpen && (
        <div
          className="modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !saving) {
              setModalOpen(false);
            }
          }}
        >
          <section className="product-modal" role="dialog" aria-modal="true">
            <div className="modal-heading">
              <div>
                <h3>{editingProduct ? "Modifier le produit" : "Ajouter un produit"}</h3>
                <p>Les informations seront enregistrées dans MySQL.</p>
              </div>
              <button
                className="icon-button"
                onClick={() => setModalOpen(false)}
                disabled={saving}
                aria-label="Fermer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <label>
                  Référence *
                  <input
                    name="reference"
                    value={form.reference}
                    onChange={updateForm}
                    maxLength={50}
                    required
                  />
                </label>
                <label>
                  Nom du produit *
                  <input
                    name="name"
                    value={form.name}
                    onChange={updateForm}
                    maxLength={150}
                    required
                  />
                </label>
                <label>
                  Catégorie *
                  <input
                    name="category"
                    value={form.category}
                    onChange={updateForm}
                    maxLength={100}
                    list="product-categories"
                    required
                  />
                  <datalist id="product-categories">
                    {categories.map((item) => (
                      <option key={item} value={item} />
                    ))}
                  </datalist>
                </label>
                <label>
                  Marque
                  <input
                    name="brand"
                    value={form.brand}
                    onChange={updateForm}
                    maxLength={100}
                  />
                </label>
                <label>
                  Prix (€) *
                  <input
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={updateForm}
                    required
                  />
                </label>
                <label>
                  Quantité *
                  <input
                    name="quantity"
                    type="number"
                    min="0"
                    step="1"
                    value={form.quantity}
                    onChange={updateForm}
                    required
                  />
                </label>
                <label>
                  Seuil de stock faible *
                  <input
                    name="minimumStock"
                    type="number"
                    min="0"
                    step="1"
                    value={form.minimumStock}
                    onChange={updateForm}
                    required
                  />
                </label>
                <label className="full-width-field">
                  Description
                  <textarea
                    name="description"
                    rows="3"
                    value={form.description}
                    onChange={updateForm}
                  />
                </label>
              </div>

              {formError && (
                <p className="form-error" role="alert">{formError}</p>
              )}

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => setModalOpen(false)}
                  disabled={saving}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="primary-button"
                  disabled={saving}
                >
                  {saving ? (
                    <><LoaderCircle size={16} /> Enregistrement...</>
                  ) : (
                    <><Plus size={16} /> {editingProduct ? "Enregistrer" : "Ajouter le produit"}</>
                  )}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}

function ProductTable({ products, loading, onEdit, onDelete }) {
  if (loading) {
    return (
      <div className="empty-state">
        <LoaderCircle size={27} className="loading-icon" />
        <strong>Chargement des produits...</strong>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="empty-state">
        <Package size={32} />
        <strong>Aucun produit trouvé</strong>
        <span>
          Ajoutez un produit ou modifiez les filtres pour afficher des résultats.
        </span>
      </div>
    );
  }

  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Produit</th>
            <th>Catégorie</th>
            <th>Prix</th>
            <th>Quantité</th>
            <th>Statut</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => {
            const status = getStockStatus(product);

            return (
              <tr key={product.id}>
                <td>
                  <div className="product-name">
                    <div className="product-placeholder">
                      <Package size={19} />
                    </div>
                    <div className="product-cell-details">
                      <strong>{product.name}</strong>
                      <span>{product.reference}</span>
                    </div>
                  </div>
                </td>
                <td>{product.category}</td>
                <td className="price-cell">{formatPrice(product.price)}</td>
                <td>{product.quantity}</td>
                <td>
                  <span className={`product-status ${status.className}`}>
                    {status.label === "Stock faible" && <AlertTriangle size={13} />}
                    {status.label}
                  </span>
                </td>
                <td>
                  <div className="row-actions">
                    <button
                      className="icon-button"
                      onClick={() => onEdit(product)}
                      aria-label={`Modifier ${product.name}`}
                      title="Modifier"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      className="icon-button delete-action"
                      onClick={() => onDelete(product)}
                      aria-label={`Supprimer ${product.name}`}
                      title="Supprimer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default App;
