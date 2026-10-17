// Safari (iPhone) no trae BarcodeDetector y qr-scanner cae a su lector JS,
// que no lee los QR densos de las tarjetas vCard ni los que llevan logo.
// Aquí se instala ZXing (WebAssembly) como BarcodeDetector cuando el
// navegador no tiene uno propio; qr-scanner lo usa solo. El .wasm se sirve
// desde nuestro dominio para no depender de un CDN con la señal de una feria.
import { BarcodeDetector, prepareZXingModule } from 'barcode-detector/ponyfill';
import wasmUrl from 'zxing-wasm/reader/zxing_reader.wasm?url';

prepareZXingModule({
  overrides: { locateFile: (path: string, prefix: string) => (path.endsWith('.wasm') ? wasmUrl : prefix + path) },
});

const g = globalThis as { BarcodeDetector?: unknown };
g.BarcodeDetector ??= BarcodeDetector;
