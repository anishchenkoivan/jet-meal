import { CourierWorkflowClient } from "../../../../src/components/CourierWorkflow/CourierWorkflowClient";

export default function CourierWorkflowPage() {
  const yandexMapsApiKey =
    process.env["NEXT_PUBLIC_YANDEX_MAPS_API_KEY"] ?? "";
  return <CourierWorkflowClient yandexMapsApiKey={yandexMapsApiKey} />;
}
