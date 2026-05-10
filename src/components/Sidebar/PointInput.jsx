export default function PointInput({ type, label, point, setPoint, pickingMode, setPickingMode }) {

    // Helper to handle manual typed input
    const handleCoordinateChange = (index, value) => {
        const newPoint = point ? [...point] : ['', ''];
        newPoint[index] = value;
        setPoint(newPoint);
    };

    const isPicking = pickingMode === type;

    return (
        <div className="point-controls">
            <label className={`point-label ${type}-label`}>{label}</label>
            <div className="coord-inputs">
                <input
                    type="number"
                    placeholder="Lat"
                    value={point ? point[0] : ''}
                    onChange={(e) => handleCoordinateChange(0, e.target.value)}
                />
                <input
                    type="number"
                    placeholder="Lon"
                    value={point ? point[1] : ''}
                    onChange={(e) => handleCoordinateChange(1, e.target.value)}
                />
            </div>
            <button
                className={`btn-pick ${isPicking ? 'active' : ''}`}
                onClick={() => setPickingMode(isPicking ? null : type)}
            >
                {isPicking ? 'Click on Map (Cancel)' : 'Pick on Map'}
            </button>
        </div>
    );
}