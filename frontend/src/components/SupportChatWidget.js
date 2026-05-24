import React, { useEffect, useRef, useState, useCallback } from "react";
import axios from "axios";
import "./SupportChatWidget.css";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://vercel-backend-zeta-green.vercel.app"
    : "http://localhost:5000");

// ============ MESSAGE COMPONENTS ============

function ProductCard({ product }) {
  return (
    <a
      href={`/product/${product.id}`}
      className="agent-product-card"
      key={product.id}
    >
      {product.image && (
        <img
          src={product.image}
          alt={product.name}
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      )}
      <div className="agent-product-info">
        <strong>{product.name}</strong>
        <span className="agent-product-price">{product.price}</span>
        {product.category && (
          <span className="agent-product-cat">{product.category}</span>
        )}
        {product.relevance && (
          <span className="agent-product-relevance">
            {product.relevance} match
          </span>
        )}
      </div>
    </a>
  );
}

function ComparisonTable({ data }) {
  if (!data || data.length === 0) return null;
  const fields = ["name", "price", "category", "stock", "shop"];
  const labels = {
    name: "Product",
    price: "Price",
    category: "Category",
    stock: "Availability",
    shop: "Shop",
  };

  return (
    <div className="agent-comparison-wrap">
      <table className="agent-comparison-table">
        <tbody>
          {fields.map((field) => (
            <tr key={field}>
              <th>{labels[field] || field}</th>
              {data.map((item, i) => (
                <td key={i}>{item[field] || "N/A"}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function OrderCards({ data }) {
  if (!data || data.length === 0) return null;
  return (
    <div className="agent-orders-list">
      {data.map((order, i) => (
        <div key={i} className="agent-order-card">
          <div className="agent-order-header">
            <span className="agent-order-id">#{order.id}</span>
            <span
              className={`agent-order-status ${order.status}`}
            >
              {order.status}
            </span>
          </div>
          <div className="agent-order-body">
            <span>{order.date}</span>
            <strong>{order.total}</strong>
          </div>
          {order.items && (
            <div className="agent-order-items">
              {order.items.map((item, j) => (
                <span key={j}>
                  {item.quantity}x {item.name}
                </span>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function ShopCards({ data }) {
  if (!data || data.length === 0) return null;
  return (
    <div className="agent-shops-list">
      {data.map((shop, i) => (
        <div key={i} className="agent-shop-card">
          <div className="agent-shop-icon">🏬</div>
          <div className="agent-shop-details">
            <strong>{shop.name}</strong>
            <span>{shop.address}, {shop.city}</span>
            <small>📍 {shop.radius}km delivery radius</small>
          </div>
        </div>
      ))}
    </div>
  );
}

function RichContent({ toolResult }) {
  if (!toolResult || !toolResult.success) return null;

  switch (toolResult.type) {
    case "products":
      return toolResult.data && toolResult.data.length > 0 ? (
        <div className="agent-products-grid">
          {toolResult.data.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : null;

    case "comparison":
      return <ComparisonTable data={toolResult.data} />;

    case "orders":
      return <OrderCards data={toolResult.data} />;

    case "stock":
      return toolResult.data && toolResult.data.length > 0 ? (
        <div className="agent-stock-list">
          {toolResult.data.map((item, i) => (
            <div
              key={i}
              className={`agent-stock-item ${item.inStock ? "in" : "out"}`}
            >
              <span>{item.name}</span>
              <strong>
                {item.inStock ? `${item.stock} in stock` : "Out of stock"}
              </strong>
              <span>{item.price}</span>
            </div>
          ))}
        </div>
      ) : null;

    case "delivery":
      return toolResult.data ? (
        <div
          className={`agent-delivery-card ${toolResult.data.deliverable ? "yes" : "no"}`}
        >
          <span className="agent-delivery-icon">
            {toolResult.data.deliverable ? "✅" : "⚠️"}
          </span>
          <p>{toolResult.data.message}</p>
        </div>
      ) : null;

    case "cart_action":
      return toolResult.data ? (
        <div className="agent-cart-confirm">
          <span className="agent-cart-check">✓</span>
          <div>
            <strong>{toolResult.data.product}</strong>
            <span>
              {toolResult.data.quantity}x — {toolResult.data.price}
            </span>
          </div>
          <a href="/cart" className="agent-view-cart-btn">
            View Cart
          </a>
        </div>
      ) : null;

    case "shops":
      return <ShopCards data={toolResult.data} />;

    default:
      return null;
  }
}

function TypingIndicator() {
  return (
    <div className="agent-typing">
      <div className="agent-typing-dot" />
      <div className="agent-typing-dot" />
      <div className="agent-typing-dot" />
    </div>
  );
}

// ============ MAIN COMPONENT ============

function SupportChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageSearching, setImageSearching] = useState(false);
  const endRef = useRef(null);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const [initialized, setInitialized] = useState(false);

  // Auto-scroll to bottom
  useEffect(() => {
    if (open && endRef.current) {
      endRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [open, messages, loading]);

  // Initialize with personalized greeting
  const initializeChat = useCallback(async () => {
    if (initialized) return;
    setInitialized(true);

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_BASE_URL}/api/support/personalize`,
        {},
        { headers: token ? { Authorization: `Bearer ${token}` } : {} },
      );

      const { greeting, suggestions: newSuggestions } = response.data;
      setMessages([{ role: "assistant", content: greeting, toolResult: null }]);
      setSuggestions(newSuggestions || []);
    } catch {
      setMessages([
        {
          role: "assistant",
          content: "Hi! 👋 How can I help you today?",
          toolResult: null,
        },
      ]);
      setSuggestions([
        "Search for products",
        "Track my order",
        "Compare products",
      ]);
    }
  }, [initialized]);

  useEffect(() => {
    if (open) {
      initializeChat();
    }
  }, [open, initializeChat]);

  // Track product views (called from other pages via window event)
  useEffect(() => {
    const handler = (event) => {
      const { action, productId, category, query } = event.detail || {};
      const token = localStorage.getItem("token");
      if (!token) return;

      axios
        .post(
          `${API_BASE_URL}/api/activity/track`,
          { action, productId, category, query },
          { headers: { Authorization: `Bearer ${token}` } },
        )
        .catch(() => {});
    };

    window.addEventListener("qb-track", handler);
    return () => window.removeEventListener("qb-track", handler);
  }, []);

  // ============ HANDLERS ============

  const handleSend = async (overrideText) => {
    const text = (overrideText || input).trim();
    if (!text || loading) return;

    const userMessage = { role: "user", content: text, toolResult: null };
    const nextMessages = [...messages, userMessage];

    setMessages(nextMessages);
    setInput("");
    setSuggestions([]);
    setLoading(true);

    const history = nextMessages.slice(-10).map((item) => ({
      role: item.role,
      content: item.content,
    }));

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_BASE_URL}/api/support/chat`,
        { message: text, history },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} },
      );

      const { reply: rawReply, toolResult, sources } = response.data;

      // Clean any TOOL_CALL leaks from the response
      const reply = (rawReply || "")
        .replace(/TOOL_CALL\s*:\s*\{[^}]*(\{[^}]*\}[^}]*)?\}/gi, "")
        .replace(/^\s*\}\s*/gm, "")
        .replace(/```json[\s\S]*?```/gi, "")
        .replace(/```[\s\S]*?```/gi, "")
        .trim() || (toolResult?.message || "Here are the results:");

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: reply,
          toolResult: toolResult || null,
          sources: sources || [],
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I'm having trouble connecting right now. Please try again in a moment. 🔄",
          toolResult: null,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    if (window.confirm("Are you sure you want to clear the chat history?")) {
      setMessages([]);
      setInitialized(false);
      setOpen(false);
      setTimeout(() => setOpen(true), 100);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Preview
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target.result;
      setImagePreview(base64);
      setImageSearching(true);

      // Add user message with image
      setMessages((prev) => [
        ...prev,
        { role: "user", content: "🖼️ Searching by image...", image: base64 },
      ]);

      try {
        const token = localStorage.getItem("token");
        const response = await axios.post(
          `${API_BASE_URL}/api/support/image-search`,
          { image: base64 },
          { headers: token ? { Authorization: `Bearer ${token}` } : {} },
        );

        const { description, products } = response.data;

        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `I see: **${description}**\n\nHere are similar products in our store:`,
            toolResult:
              products && products.length > 0
                ? { success: true, type: "products", data: products }
                : null,
          },
        ]);
      } catch (err) {
        const fallbackMsg =
          err.response?.data?.fallback
            ? err.response.data.message
            : "Image search encountered an issue. Try describing the product in text instead! 📝";

        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: fallbackMsg },
        ]);
      } finally {
        setImagePreview(null);
        setImageSearching(false);
      }
    };
    reader.readAsDataURL(file);

    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const handleSuggestionClick = (suggestion) => {
    handleSend(suggestion);
  };

  // ============ RENDER ============

  return (
    <div className="agent-chat" id="agent-chat-widget">
      {open && (
        <div className="agent-chat-panel">
          {/* Header */}
          <div className="agent-chat-header">
            <div className="agent-chat-header-info">
              <div className="agent-chat-avatar">
                <span>Q</span>
                <span className="agent-chat-status" />
              </div>
              <div>
                <h4>QuickBazaar AI</h4>
                <span>Smart Shopping Assistant</span>
              </div>
            </div>
            <div className="agent-chat-header-actions">
              <button
                type="button"
                className="agent-chat-clear"
                onClick={handleClearChat}
                title="Clear Chat"
              >
                🗑️
              </button>
              <button
                type="button"
                className="agent-chat-close"
                onClick={() => setOpen(false)}
                aria-label="Close chat"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="agent-chat-messages">
            {messages.map((item, index) => (
              <div key={index} className={`agent-msg ${item.role}`}>
                {item.role === "assistant" && (
                  <div className="agent-msg-avatar">Q</div>
                )}
                <div className="agent-msg-bubble">
                  {item.image && (
                    <img
                      src={item.image}
                      alt="Uploaded"
                      className="agent-msg-image"
                    />
                  )}
                  <div
                    className="agent-msg-text"
                    dangerouslySetInnerHTML={{
                      __html: formatMessage(item.content),
                    }}
                  />
                  {item.toolResult && <RichContent toolResult={item.toolResult} />}
                  {item.sources && item.sources.length > 0 && (
                    <div className="agent-msg-sources">
                      {item.sources.slice(0, 3).map((s, i) => (
                        <span key={i} className="agent-source-tag">
                          {s.title}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="agent-msg assistant">
                <div className="agent-msg-avatar">Q</div>
                <div className="agent-msg-bubble">
                  <TypingIndicator />
                </div>
              </div>
            )}

            {imageSearching && (
              <div className="agent-msg assistant">
                <div className="agent-msg-avatar">Q</div>
                <div className="agent-msg-bubble">
                  <div className="agent-msg-text">
                    🔍 Analyzing your image...
                  </div>
                  <TypingIndicator />
                </div>
              </div>
            )}

            <div ref={endRef} />
          </div>

          {/* Suggestions */}
          {suggestions.length > 0 && messages.length <= 2 && (
            <div className="agent-suggestions">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  type="button"
                  className="agent-suggestion-chip"
                  onClick={() => handleSuggestionClick(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Image Preview */}
          {imagePreview && (
            <div className="agent-image-preview">
              <img src={imagePreview} alt="Preview" />
              <span>Searching...</span>
            </div>
          )}

          {/* Input Area */}
          <div className="agent-chat-input">
            <button
              type="button"
              className="agent-upload-btn"
              onClick={() => fileInputRef.current?.click()}
              aria-label="Upload image"
              title="Search by image"
            >
              📷
            </button>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: "none" }}
            />
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything..."
              disabled={loading || imageSearching}
            />
            <button
              type="button"
              className="agent-send-btn"
              onClick={() => handleSend()}
              disabled={loading || imageSearching || !input.trim()}
              aria-label="Send message"
            >
              ➤
            </button>
          </div>
        </div>
      )}

      {!open && (
        <button
          type="button"
          className="agent-chat-fab"
          onClick={() => setOpen(true)}
          aria-label="Open AI Assistant"
          id="agent-chat-fab"
        >
          <span className="agent-fab-icon">💬</span>
          <span className="agent-fab-pulse" />
        </button>
      )}
    </div>
  );
}

// ============ HELPERS ============

function formatMessage(text) {
  if (!text) return "";
  
  // Clean up any remaining TOOL_CALL or JSON blocks that might have leaked
  let cleaned = text
    .replace(/TOOL_CALL\s*:\s*\{[^}]*(\{[^}]*\}[^}]*)?\}/gi, "")
    .replace(/```json[\s\S]*?```/gi, "")
    .trim();

  if (!cleaned) return "<em>Fetching data...</em>";

  return cleaned
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/\n/g, "<br/>")
    .replace(
      /`(.*?)`/g,
      '<code style="background:rgba(99,102,241,0.1);padding:2px 6px;border-radius:4px;font-size:0.85em">$1</code>',
    );
}

export default SupportChatWidget;
