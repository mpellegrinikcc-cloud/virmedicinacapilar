import { useMemo } from 'react';

function PhotoUploader({ files, onChange }) {
  const fileList = useMemo(() => files || [], [files]);

  function handleFiles(event) {
    const raw = Array.from(event.target.files || []);
    const selected = raw.slice(0, 4);
    onChange(selected);
  }

  return (
    <div className="report-card">
      <div>
        <label htmlFor="photo-upload" className="report-tag">
          Hasta 4 fotos
        </label>
        <p style={{ margin: '12px 0 0', color: '#475569' }}>
          Toma fotos nítidas de la coronilla, línea frontal y zona donante. El análisis es solo preliminar.
        </p>
      </div>

      <input
        id="photo-upload"
        type="file"
        accept="image/*"
        multiple
        onChange={handleFiles}
      />

      {fileList.length > 0 && (
        <div className="file-grid">
          {fileList.map((file, index) => (
            <div key={`${file.name}-${index}`} className="file-item">
              <span>{file.name}</span>
              <small>{(file.size / 1024).toFixed(1)} KB</small>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PhotoUploader;
