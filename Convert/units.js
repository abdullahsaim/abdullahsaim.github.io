/* Factors convert each unit into the category's base unit. Temperature uses affine transforms. */
const categories = {
  Length: {icon:'↔', units:[['m','Meters',1],['km','Kilometers',1000],['cm','Centimeters',.01],['mm','Millimeters',.001],['in','Inches',.0254],['ft','Feet',.3048],['yd','Yards',.9144],['mi','Miles',1609.344]], defaults:['km','m'], presets:[['Miles → kilometers','mi','km'],['Feet → meters','ft','m'],['Inches → centimeters','in','cm']]},
  Weight: {icon:'⚖', units:[['kg','Kilograms',1],['g','Grams',.001],['mg','Milligrams',.000001],['lb','Pounds',.45359237],['oz','Ounces',.028349523125],['st','Stone',6.35029318],['t','Metric tonnes',1000]], defaults:['kg','lb'], presets:[['Pounds → kilograms','lb','kg'],['Ounces → grams','oz','g']]},
  Temperature: {icon:'◉', units:[['°C','Celsius'],['°F','Fahrenheit'],['K','Kelvin']], defaults:['°C','°F'], presets:[['Celsius → Fahrenheit','°C','°F'],['Fahrenheit → Celsius','°F','°C']]},
  Volume: {icon:'◡', units:[['L','Liters',1],['mL','Milliliters',.001],['m³','Cubic meters',1000],['US gal','US gallons',3.785411784],['US qt','US quarts',.946352946],['US cup','US cups',.2365882365],['US fl oz','US fluid ounces',.0295735295625],['US tbsp','US tablespoons',.01478676478125],['US tsp','US teaspoons',.00492892159375],['imp gal','Imperial gallons',4.54609]], defaults:['L','US gal'], presets:[['US cups → milliliters','US cup','mL'],['US gallons → liters','US gal','L']]},
  Speed: {icon:'↗', units:[['m/s','Meters per second',1],['km/h','Kilometers per hour',1/3.6],['mph','Miles per hour',.44704],['kn','Knots',1852/3600],['ft/s','Feet per second',.3048]], defaults:['km/h','mph'], presets:[['MPH → km/h','mph','km/h'],['Knots → km/h','kn','km/h']]},
  Area: {icon:'▧', units:[['m²','Square meters',1],['km²','Square kilometers',1e6],['cm²','Square centimeters',.0001],['ft²','Square feet',.09290304],['in²','Square inches',.00064516],['ha','Hectares',10000],['ac','Acres',4046.8564224],['mi²','Square miles',2589988.110336]], defaults:['m²','ft²'], presets:[['Acres → hectares','ac','ha'],['Square feet → m²','ft²','m²']]},
  Time: {icon:'◷', units:[['s','Seconds',1],['ms','Milliseconds',.001],['min','Minutes',60],['h','Hours',3600],['d','Days',86400],['wk','Weeks',604800]], defaults:['h','min'], presets:[['Hours → minutes','h','min'],['Days → hours','d','h']]},
  Storage: {icon:'▤', units:[['B','Bytes',1],['bit','Bits',.125],['kB','Kilobytes',1e3],['MB','Megabytes',1e6],['GB','Gigabytes',1e9],['TB','Terabytes',1e12],['KiB','Kibibytes',1024],['MiB','Mebibytes',1024**2],['GiB','Gibibytes',1024**3],['TiB','Tebibytes',1024**4]], defaults:['GB','MB'], presets:[['Gigabytes → megabytes','GB','MB'],['GiB → GB','GiB','GB']]}
};
function convert(value, from, to, category) {
  if (!Number.isFinite(value)) throw Error('Enter a finite number.');
  const units=categories[category]?.units;
  const source=units?.find(unit=>unit[0]===from), target=units?.find(unit=>unit[0]===to);
  if(!source||!target)throw Error('Choose valid units.');
  if(category==='Temperature') {
    const c=from==='°F'?(value-32)*5/9:from==='K'?value-273.15:value;
    if(c < -273.15 - 1e-10)throw Error('Temperature cannot be below absolute zero (−273.15 °C).');
    const result=to==='°F'?c*9/5+32:to==='K'?c+273.15:c;
    if(!Number.isFinite(result))throw Error('This number is too large. Try a smaller value.');
    return Math.abs(result)<1e-12?0:result;
  }
  if(value<0)throw Error('Enter zero or a positive value for this measurement.');
  const result=value*(source[2]/target[2]);
  if(!Number.isFinite(result))throw Error('This number is too large. Try a smaller value.');
  return result;
}
if(typeof module!=='undefined')module.exports={categories,convert};
