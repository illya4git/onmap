export default function Sidebar({ isOpen, toggleSidebar }) {
    return (
        <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
            <div className="sidebar-header">
                <h2>Map Controls</h2>
                <button onClick={toggleSidebar}>Close</button>
            </div>
            <div className="sidebar-content">
                <p>Hello world!</p>
            </div>
        </aside>
    )
}