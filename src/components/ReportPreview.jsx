function ReportPreview({ assessment, isReady }) {
  if (!isReady) {
    return (
      <div className="report-card">
        <h3>Listo para evaluar</h3>
        <p>Haz clic en "Generar evaluación" para ver el resultado preliminar del análisis capilar.</p>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="report-card">
        <h3>No hay fotos</h3>
        <p>Sube al menos una imagen para obtener un diagnóstico preliminar.</p>
      </div>
    );
  }

  return (
    <div className="report-card">
      <div>
        <span className="report-tag">Resultado preliminar</span>
      </div>
      <ul className="report-list">
        <li>
          <strong>Etapa estimada:</strong> {assessment.stage}
        </li>
        <li>
          <strong>Evaluación de densidad:</strong> {assessment.density}
        </li>
        <li>
          <strong>Zona donante:</strong> {assessment.donorQuality}
        </li>
        <li>
          <strong>Línea frontal:</strong> {assessment.hairline}
        </li>
        <li>
          <strong>Recomendaciones:</strong> {assessment.recommendations}
        </li>
      </ul>
      <p style={{ color: '#475569', margin: 0 }}>
        Este informe es informativo y no sustituye la consulta médica presencial. La clínica debe confirmar el diagnóstico con un examen directo.
      </p>
    </div>
  );
}

export default ReportPreview;
