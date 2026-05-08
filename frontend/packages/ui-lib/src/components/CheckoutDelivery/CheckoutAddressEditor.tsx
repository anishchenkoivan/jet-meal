"use client";

import { Button } from "../Button/Button";
import { Input } from "../Input/Input";
import { Typography } from "../Typography/Typography";
import type { CheckoutAddressModel } from "./useCheckoutAddress";
import { YandexMapPicker } from "./YandexMapPicker";
import styles from "./CheckoutAddressEditor.module.css";

export type CheckoutAddressEditorProps = {
  yandexMapsApiKey: string;
  model: CheckoutAddressModel;
  onCancel: () => void;
  onSave: () => void;
};

export function CheckoutAddressEditor({
  yandexMapsApiKey,
  model,
  onCancel,
  onSave,
}: CheckoutAddressEditorProps) {
  return (
    <div className={styles["root"]}>
      <div className={styles["scroll"]}>
        <label className={styles["fieldLabel"]} htmlFor="checkout-address-editor">
          Адрес доставки
        </label>
        <Input
          id="checkout-address-editor"
          value={model.addressLine}
          onChange={(e) => model.setAddressLine(e.target.value)}
          placeholder="Улица, дом, квартира, подъезд, домофон"
          size="large"
          className={styles["addressInput"]}
        />

        {model.geoCoords && model.geoLabel ? (
          <div className={styles["geoBlock"]}>
            <p className={styles["pickerLabel"]}>Вы здесь:</p>
            <p className={styles["geoLine"]}>{model.geoLabel}</p>
            <div className={styles["geoActions"]}>
              <Button type="primary" size="small" onClick={model.onUseGeo}>
                Да
              </Button>
              <Typography.Text type="secondary">
                Другой адрес — на карте ниже
              </Typography.Text>
            </div>
          </div>
        ) : null}

        {model.addresses.length > 0 ? (
          <div className={styles["savedBlock"]}>
            <p className={styles["pickerLabel"]}>Сохранённые адреса</p>
            <ul className={styles["savedList"]}>
              {model.addresses.map((a) => (
                <li key={a.id}>
                  <Button
                    type="default"
                    block
                    className={styles["savedBtn"]}
                    onClick={() => model.pickSaved(a)}
                  >
                    {a.label}
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className={styles["mapWrap"]}>
          <YandexMapPicker
            apiKey={yandexMapsApiKey}
            latitude={model.mapLat}
            longitude={model.mapLng}
            onCoordinatesChange={model.setMapCoords}
          />
        </div>
      </div>

      <div className={styles["foot"]}>
        <Typography.Text type="secondary">
          «Отмена» закроет окно без сохранения.
        </Typography.Text>
        <div className={styles["footBtns"]}>
          <Button type="link" onClick={onCancel}>
            Отмена
          </Button>
          <Button
            type="primary"
            onClick={() => {
              model.persist();
              onSave();
            }}
          >
            Сохранить адрес
          </Button>
        </div>
      </div>
    </div>
  );
}
