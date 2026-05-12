{{- define "ssr.name" -}}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- end }}

{{- define "ssr.labels" -}}
app.kubernetes.io/name: {{ include "ssr.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{- define "ssr.selectorLabels" -}}
app.kubernetes.io/name: {{ include "ssr.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}
