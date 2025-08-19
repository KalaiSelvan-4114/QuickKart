import { useState } from "react";
import { 
  decimalToDMS, 
  dmsToDecimal, 
  coordsToDMS, 
  dmsToCoords, 
  formatCoordinates,
  isValidDMS,
  parseCoordinateInput 
} from "../utils/coordinateConverter";

export default function CoordinateDemo() {
  const [decimalLat, setDecimalLat] = useState("10.3651");
  const [decimalLng, setDecimalLng] = useState("77.9803");
  const [dmsLat, setDmsLat] = useState("10°27'27.3\"N");
  const [dmsLng, setDmsLng] = useState("77°53'28.5\"E");
  const [inputCoords, setInputCoords] = useState("");
  const [parsedResult, setParsedResult] = useState("");

  const convertDecimalToDMS = () => {
    const lat = parseFloat(decimalLat);
    const lng = parseFloat(decimalLng);
    
    if (!isNaN(lat) && !isNaN(lng)) {
      const latDMS = decimalToDMS(lat, 'N');
      const lngDMS = decimalToDMS(lng, 'E');
      setDmsLat(latDMS);
      setDmsLng(lngDMS);
    }
  };

  const convertDMSToDecimal = () => {
    const lat = dmsToDecimal(dmsLat);
    const lng = dmsToDecimal(dmsLng);
    
    if (lat !== null && lng !== null) {
      setDecimalLat(lat.toFixed(6));
      setDecimalLng(lng.toFixed(6));
    }
  };

  const parseInput = () => {
    const result = parseCoordinateInput(inputCoords);
    if (result) {
      setParsedResult(`Parsed successfully: Lat: ${result.lat.toFixed(6)}, Lng: ${result.lng.toFixed(6)}`);
    } else {
      setParsedResult("Could not parse coordinates. Please check the format.");
    }
  };

  const validateDMS = () => {
    const isValid = isValidDMS(inputCoords);
    setParsedResult(`DMS validation: ${isValid ? 'Valid' : 'Invalid'} format`);
  };

  const clearResults = () => {
    setParsedResult("");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Coordinate Conversion Demo</h1>
          <p className="text-gray-600">Convert between Decimal Degrees and DMS (Degrees, Minutes, Seconds) format</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Decimal to DMS Conversion */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Decimal to DMS</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Latitude (Decimal)</label>
                <input
                  type="number"
                  step="any"
                  value={decimalLat}
                  onChange={(e) => setDecimalLat(e.target.value)}
                  className="input-field w-full"
                  placeholder="e.g., 10.3651"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Longitude (Decimal)</label>
                <input
                  type="number"
                  step="any"
                  value={decimalLng}
                  onChange={(e) => setDecimalLng(e.target.value)}
                  className="input-field w-full"
                  placeholder="e.g., 77.9803"
                />
              </div>
              <button
                onClick={convertDecimalToDMS}
                className="btn-primary w-full"
              >
                Convert to DMS
              </button>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Result:</p>
                <p className="font-mono text-lg">
                  {dmsLat} {dmsLng}
                </p>
              </div>
            </div>
          </div>

          {/* DMS to Decimal Conversion */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">DMS to Decimal</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Latitude (DMS)</label>
                <input
                  type="text"
                  value={dmsLat}
                  onChange={(e) => setDmsLat(e.target.value)}
                  className="input-field w-full"
                  placeholder="e.g., 10°27'27.3N"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Longitude (DMS)</label>
                <input
                  type="text"
                  value={dmsLng}
                  onChange={(e) => setDmsLng(e.target.value)}
                  className="input-field w-full"
                  placeholder="e.g., 77°53'28.5E"
                />
              </div>
              <button
                onClick={convertDMSToDecimal}
                className="btn-primary w-full"
              >
                Convert to Decimal
              </button>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Result:</p>
                <p className="font-mono text-lg">
                  {decimalLat}, {decimalLng}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Coordinate Parser */}
        <div className="bg-white rounded-xl shadow-lg p-6 mt-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Coordinate Parser</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter Coordinates (Decimal or DMS format)
              </label>
              <input
                type="text"
                value={inputCoords}
                onChange={(e) => setInputCoords(e.target.value)}
                className="input-field w-full"
                                  placeholder="e.g., 10.3651,77.9803 or 10°27'27.3N 77°53'28.5E"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={parseInput}
                className="btn-primary flex-1"
              >
                Parse Coordinates
              </button>
              <button
                onClick={validateDMS}
                className="btn-secondary flex-1"
              >
                Validate DMS
              </button>
              <button
                onClick={clearResults}
                className="btn-secondary"
              >
                Clear
              </button>
            </div>
            {parsedResult && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Result:</p>
                <p className="font-mono">{parsedResult}</p>
              </div>
            )}
          </div>
        </div>

        {/* Examples */}
        <div className="bg-white rounded-xl shadow-lg p-6 mt-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Examples</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Decimal Format</h3>
              <div className="space-y-2 text-sm">
                <p><strong>New Delhi:</strong> 28.6139, 77.2090</p>
                <p><strong>Mumbai:</strong> 19.0760, 72.8777</p>
                <p><strong>Chennai:</strong> 13.0827, 80.2707</p>
                <p><strong>Kolkata:</strong> 22.5726, 88.3639</p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">DMS Format</h3>
              <div className="space-y-2 text-sm">
                <p><strong>New Delhi:</strong> 28°36'50"N 77°12'32"E</p>
                <p><strong>Mumbai:</strong> 19°04'34"N 72°52'40"E</p>
                <p><strong>Chennai:</strong> 13°04'58"N 80°16'15"E</p>
                <p><strong>Kolkata:</strong> 22°34'21"N 88°21'50"E</p>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mt-8">
          <h2 className="text-xl font-bold text-blue-800 mb-4">How to Use</h2>
          <div className="space-y-3 text-blue-700">
            <p><strong>Decimal Format:</strong> Use decimal degrees (e.g., 10.3651, 77.9803)</p>
            <p><strong>DMS Format:</strong> Use degrees, minutes, seconds (e.g., 10°27'27.3"N 77°53'28.5"E)</p>
            <p><strong>Parser:</strong> Enter coordinates in either format and the parser will automatically detect and convert them</p>
            <p><strong>Validation:</strong> Use the Validate DMS button to check if your DMS format is correct</p>
          </div>
        </div>
      </div>
    </div>
  );
}
