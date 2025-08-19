# Coordinate System Documentation

## Overview

The QuickKart application now supports both decimal degrees and DMS (Degrees, Minutes, Seconds) coordinate formats for location input and display.

## Supported Formats

### 1. Decimal Degrees
- **Format**: `latitude, longitude`
- **Example**: `10.3651, 77.9803`
- **Use Case**: Standard GPS coordinates, easy to copy from Google Maps

### 2. DMS (Degrees, Minutes, Seconds)
- **Format**: `DD°MM'SS.S"N DD°MM'SS.S"E`
- **Example**: `10°27'27.3"N 77°53'28.5"E`
- **Use Case**: Traditional surveying format, more precise for some applications

## How to Use

### For Shop Owners
1. **During Shop Registration**: 
   - Use GPS button to get current location
   - Paste Google Maps links
   - Enter coordinates manually in either format
   - The system automatically converts and displays both formats

2. **Location Display**: 
   - Shows both decimal and DMS formats
   - Updates automatically when location changes

### For Users
1. **Setting Location**: 
   - Use GPS button for automatic location
   - Enter coordinates manually in either format
   - System parses and validates input

2. **Viewing Location**: 
   - See coordinates in both formats in debug info
   - Helps with location verification

## Coordinate Conversion Functions

### Core Functions
- `decimalToDMS(decimal, direction)` - Convert decimal to DMS
- `dmsToDecimal(dmsString)` - Convert DMS to decimal
- `coordsToDMS(coords)` - Convert coordinate object to DMS
- `dmsToCoords(latDMS, lngDMS)` - Convert DMS to coordinate object

### Utility Functions
- `formatCoordinates(coords, format)` - Format for display
- `isValidDMS(dmsString)` - Validate DMS format
- `parseCoordinateInput(input)` - Auto-detect and parse coordinates

## Examples

### Indian Cities

| City | Decimal | DMS |
|------|---------|-----|
| New Delhi | 28.6139, 77.2090 | 28°36'50"N 77°12'32"E |
| Mumbai | 19.0760, 72.8777 | 19°04'34"N 72°52'40"E |
| Chennai | 13.0827, 80.2707 | 13°04'58"N 80°16'15"E |
| Kolkata | 22.5726, 88.3639 | 22°34'21"N 88°21'50"E |

### Sample Coordinates
- **Decimal**: `10.3651, 77.9803`
- **DMS**: `10°27'27.3"N 77°53'28.5"E`

## Demo Page

Visit `/coordinate-demo` to:
- Convert between decimal and DMS formats
- Test coordinate parsing
- Validate DMS format
- See examples of different coordinate formats

## Integration Points

### Frontend
- Shop signup form
- User location modal
- Coordinate display components
- Debug information panels

### Backend
- Location storage in decimal format
- Coordinate validation
- Distance calculations using Haversine formula

## Technical Details

### DMS Format Parsing
- Regex pattern: `/^(\d+)°(\d+)'(\d+(?:\.\d+)?)"([NSEW])$/i`
- Supports decimal seconds (e.g., 27.3")
- Case-insensitive direction letters

### Coordinate Validation
- Latitude range: -90 to +90
- Longitude range: -180 to +180
- Automatic direction detection based on sign

### Error Handling
- Graceful fallback for invalid input
- User-friendly error messages
- Input validation before submission

## Best Practices

1. **Input Validation**: Always validate coordinates before saving
2. **Format Consistency**: Store coordinates in decimal format in database
3. **User Experience**: Display coordinates in user's preferred format
4. **Error Handling**: Provide clear feedback for invalid coordinates
5. **Accessibility**: Support both decimal and DMS formats for different user needs

## Future Enhancements

- Support for additional coordinate systems (UTM, MGRS)
- Batch coordinate conversion
- Coordinate history and favorites
- Integration with mapping services
- Advanced geocoding capabilities
