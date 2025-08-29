import { useEffect, useRef } from "react";

export default function QrScanner({ onScan, onError, fps = 10 }) {
  const divRef = useRef(null);
  const scannerRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const { Html5Qrcode } = await import("html5-qrcode");
        if (!isMounted || !divRef.current) return;
        const elementId = `qr-reader-${Math.random().toString(36).slice(2)}`;
        divRef.current.id = elementId;
        const html5QrCode = new Html5Qrcode(elementId);
        scannerRef.current = html5QrCode;
        const config = { fps, qrbox: { width: 250, height: 250 } };
        const success = (text) => {
          onScan && onScan(text);
          // Stop after first successful scan
          html5QrCode.stop().catch(() => {});
        };
        const failure = (err) => {
          onError && onError(err?.message || String(err));
        };
        const devices = await Html5Qrcode.getCameras();
        const backCam = devices.find(d => /back|rear|environment/i.test(d.label));
        await html5QrCode.start({ deviceId: { exact: (backCam || devices[0])?.id } }, config, success, failure);
      } catch (e) {
        onError && onError(e?.message || String(e));
      }
    })();
    return () => {
      isMounted = false;
      const s = scannerRef.current;
      if (s) {
        s.stop().catch(() => {}).finally(() => s.clear());
      }
    };
  }, [fps, onScan, onError]);

  return (
    <div className="w-full flex flex-col items-center">
      <div ref={divRef} className="w-64 h-64 bg-gray-100 rounded overflow-hidden" />
      <div className="text-xs text-gray-500 mt-2">Point camera at QR code</div>
    </div>
  );
}


