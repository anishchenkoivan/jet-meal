"use client";

import { AddressPickerField } from "@jet-meal/ui-lib/src/components/AddressPickerField/AddressPickerField";
import { AppConfirmModal } from "@jet-meal/ui-lib/src/components/AppConfirmModal/AppConfirmModal";
import { Button } from "@jet-meal/ui-lib/src/components/Button/Button";
import {
  CATALOG_FILTER_RAIL_SCROLLBAR_HIDE,
  type CatalogFilterRailLayer,
  CatalogFilterRailScroll,
} from "@jet-meal/ui-lib/src/components/CatalogFilters/CatalogFilterRailScroll";
import { FilterSection } from "@jet-meal/ui-lib/src/components/CatalogFilters/FilterSection";
import {
  ClockIcon,
  HashtagIcon,
  MapPinIcon,
  SearchIcon,
  StorefrontIcon,
} from "@jet-meal/ui-lib/src/components/Icons/Icons";
import { ImageCarousel } from "@jet-meal/ui-lib/src/components/ImageCarousel/ImageCarousel";
import { Input, TextArea } from "@jet-meal/ui-lib/src/components/Input/Input";
import type { NavListMobileAsideControls } from "@jet-meal/ui-lib/src/components/NavListBlock/NavListBlock";
import { Typography } from "@jet-meal/ui-lib/src/components/Typography/Typography";
import {
  defaultWeekHours,
  WeekHoursPicker,
  type WeekHoursValue,
} from "@jet-meal/ui-lib/src/components/WeekHoursPicker/WeekHoursPicker";
import { CatalogPageLayout } from "@jet-meal/ui-lib/src/containers/CatalogPageLayout/CatalogPageLayout";
import { PageContentShell } from "@jet-meal/ui-lib/src/containers/PageContentShell/PageContentShell";
import { getMainNavUrlsFromPublicEnv } from "@jet-meal/ui-lib/src/navigation/mainNavEnv";
import cx from "classnames";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  getContentBlockImages,
  patchBlockImagesFromUrls,
} from "../../lib/contentBlockImages";
import type {
  Restaurant,
  RestaurantContentBlock,
  RestaurantMainSection,
} from "../../types/restaurant";

function cloneRestaurant(r: Restaurant): Restaurant {
  return structuredClone(r);
}

function parsePriceNumber(subtitle: string | null | undefined): string {
  return (subtitle ?? "").replace(/\s*₽\s*$/, "").trim();
}

function formatPriceSubtitle(num: string): string {
  const v = num.trim();
  return v ? `${v} ₽` : "";
}

// ─── Aside rail ──────────────────────────────────────────────────────────────

type AdminRailProps = {
  asidePanel: "settings" | "about";
  mainLayers: CatalogFilterRailLayer[];
  aboutLayers: CatalogFilterRailLayer[];
  onSaveAbout: () => void;
  onCancelAbout: () => void;
  onDeleteRestaurant: () => void;
};

function AdminRail({
  asidePanel,
  mainLayers,
  aboutLayers,
  onSaveAbout,
  onCancelAbout,
  onDeleteRestaurant,
}: AdminRailProps) {
  const ariaLabel = useCallback((rowKey: string) => {
    const labels: Record<string, string> = {
      "g-about": "О ресторане",
      "g-status": "Статус",
      "g-admins": "Администраторы",
      "g-advert": "Продвижение",
      "ab-name": "Название",
      "ab-desc": "Описание",
      "ab-addr": "Адрес",
      "ab-hours": "Расписание",
    };
    return labels[rowKey] ?? "Раздел";
  }, []);

  const railClass = cx(
    "min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-visible",
    "[-webkit-overflow-scrolling:touch]",
    "wide:ml-[-56px]",
    CATALOG_FILTER_RAIL_SCROLLBAR_HIDE,
  );

  if (asidePanel === "about") {
    return (
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-x-visible">
        <CatalogFilterRailScroll
          layers={aboutLayers}
          scrollMode="scrollRoot"
          railIconAriaLabel={ariaLabel}
          className={railClass}
        />
        <div className="mt-auto flex shrink-0 flex-col gap-2 border-t pt-3 [border-color:var(--jm-color-border-secondary,#f0f0f0)]">
          <Button type="primary" block onClick={onSaveAbout}>
            Сохранить
          </Button>
          <button
            type="button"
            className="cursor-pointer border-none bg-transparent p-0 text-center text-sm text-[#ff4d4f] hover:underline"
            onClick={onCancelAbout}
          >
            Отменить
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-x-visible">
      <CatalogFilterRailScroll
        layers={mainLayers}
        scrollMode="scrollRoot"
        railIconAriaLabel={ariaLabel}
        className={railClass}
      />
      <div className="mt-auto flex shrink-0 flex-col gap-2 border-t pt-3 [border-color:var(--jm-color-border-secondary,#f0f0f0)]">
        <button
          type="button"
          className="cursor-pointer border-none bg-transparent p-0 text-center text-sm text-[#ff4d4f] hover:underline"
          onClick={onDeleteRestaurant}
        >
          Удалить ресторан
        </button>
      </div>
    </div>
  );
}

// ─── Page client ─────────────────────────────────────────────────────────────

export type AdminRestaurantsPageClientProps = {
  initialRestaurant: Restaurant;
  yandexMapsApiKey?: string;
  onSave?: (data: Restaurant) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
};

export function AdminRestaurantsPageClient({
  initialRestaurant,
  yandexMapsApiKey = "",
  onSave,
  onDelete,
}: AdminRestaurantsPageClientProps) {
  const aboutSnapshotRef = useRef<{
    restaurant: Restaurant;
    hours: WeekHoursValue;
  } | null>(null);

  const [restaurant, setRestaurant] = useState(() =>
    cloneRestaurant(initialRestaurant),
  );
  const [hours, setHours] = useState<WeekHoursValue>(defaultWeekHours);
  const [admins, setAdmins] = useState<string[]>([
    "owner@jet-meal.example",
    "admin@jet-meal.example",
  ]);
  const [adminsOpen, setAdminsOpen] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [hideConfirm, setHideConfirm] = useState(false);
  const [deleteRestaurantConfirm, setDeleteRestaurantConfirm] = useState(false);
  const [asidePanel, setAsidePanel] = useState<"settings" | "about">(
    "settings",
  );
  const [aboutCancelConfirm, setAboutCancelConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const advertBase = useMemo(
    () => getMainNavUrlsFromPublicEnv().businessAds.replace(/\/$/, ""),
    [],
  );

  const openAboutPanel = useCallback(() => {
    aboutSnapshotRef.current = {
      restaurant: cloneRestaurant(restaurant),
      hours: { ...hours },
    };
    setAsidePanel("about");
  }, [hours, restaurant]);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      await onSave?.(restaurant);
    } finally {
      setIsSaving(false);
    }
  }, [onSave, restaurant]);

  const handleDeleteRestaurant = useCallback(async () => {
    await onDelete?.(restaurant.id);
    setDeleteRestaurantConfirm(false);
  }, [onDelete, restaurant.id]);

  const updateBlock = useCallback(
    (
      sectionId: string,
      divisionId: string,
      blockId: string,
      patch: Partial<RestaurantContentBlock>,
    ) => {
      setRestaurant((prev) => {
        const next = cloneRestaurant(prev);
        const sec = next.mainSections?.find((s) => s.id === sectionId);
        const div = sec?.divisions.find((d) => d.id === divisionId);
        const b = div?.blocks.find((x) => x.id === blockId);
        if (b) Object.assign(b, patch);
        return next;
      });
    },
    [],
  );

  const removeBlock = useCallback(
    (sectionId: string, divisionId: string, blockId: string) => {
      setRestaurant((prev) => {
        const next = cloneRestaurant(prev);
        const sec = next.mainSections?.find((s) => s.id === sectionId);
        const div = sec?.divisions.find((d) => d.id === divisionId);
        if (div) div.blocks = div.blocks.filter((b) => b.id !== blockId);
        return next;
      });
    },
    [],
  );

  const addBlock = useCallback((sectionId: string, divisionId: string) => {
    setRestaurant((prev) => {
      const next = cloneRestaurant(prev);
      const sec = next.mainSections?.find((s) => s.id === sectionId);
      const div = sec?.divisions.find((d) => d.id === divisionId);
      if (div) {
        const id = `new-${Date.now()}`;
        div.blocks.push({
          id,
          title: "Новая позиция",
          subtitle: "100 ₽",
          extraText: "Описание",
          image: "",
          images: [],
        });
      }
      return next;
    });
  }, []);

  const renameDivision = useCallback(
    (sectionId: string, divisionId: string, title: string) => {
      setRestaurant((prev) => {
        const next = cloneRestaurant(prev);
        const sec = next.mainSections?.find((s) => s.id === sectionId);
        const div = sec?.divisions.find((d) => d.id === divisionId);
        if (div) div.title = title;
        return next;
      });
    },
    [],
  );

  const deleteDivision = useCallback(
    (sectionId: string, divisionId: string) => {
      setRestaurant((prev) => {
        const next = cloneRestaurant(prev);
        const sec = next.mainSections?.find((s) => s.id === sectionId);
        if (sec)
          sec.divisions = sec.divisions.filter((d) => d.id !== divisionId);
        return next;
      });
    },
    [],
  );

  const addDivision = useCallback((sectionId: string) => {
    setRestaurant((prev) => {
      const next = cloneRestaurant(prev);
      const sec = next.mainSections?.find((s) => s.id === sectionId);
      if (sec) {
        const id = `div-${Date.now()}`;
        sec.divisions.push({ id, title: "Новый раздел", blocks: [] });
      }
      return next;
    });
  }, []);

  const updateImage = useCallback(
    (idx: number) => {
      const current = restaurant.preview?.images[idx] ?? "";
      const u = window.prompt("URL изображения", current);
      if (u != null) {
        setRestaurant((r) => {
          const next = cloneRestaurant(r);
          const images = [...(next.preview?.images ?? [])];
          images[idx] = u;
          next.preview = { ...(next.preview ?? { images: [] }), images };
          return next;
        });
      }
    },
    [restaurant.preview?.images],
  );

  const deleteImage = useCallback((idx: number) => {
    setRestaurant((r) => {
      const next = cloneRestaurant(r);
      const images = [...(next.preview?.images ?? [])];
      images.splice(idx, 1);
      next.preview = { ...(next.preview ?? { images: [] }), images };
      return next;
    });
  }, []);

  const addImage = useCallback(() => {
    const u = window.prompt("URL нового изображения");
    if (u?.trim()) {
      setRestaurant((r) => {
        const next = cloneRestaurant(r);
        const images = [...(next.preview?.images ?? []), u.trim()];
        next.preview = { ...(next.preview ?? { images: [] }), images };
        return next;
      });
    }
  }, []);

  const p = restaurant.preview;

  const mainLayers = useMemo(
    (): CatalogFilterRailLayer[] => [
      {
        rowKey: "g-about",
        sectionId: "admin-sec-about-entry",
        icon: <StorefrontIcon size={16} />,
        section: (
          <FilterSection id="admin-sec-about-entry">
            <button
              type="button"
              className="w-full cursor-pointer rounded-lg border px-3 py-2.5 text-left text-sm font-medium [-webkit-tap-highlight-color:transparent] [border-color:var(--jm-color-border-secondary,#e8e8e8)] [color:var(--jm-color-text,rgba(0,0,0,0.88))] hover:[background:var(--jm-color-fill-quaternary,#fafafa)]"
              onClick={openAboutPanel}
            >
              О ресторане
            </button>
          </FilterSection>
        ),
      },
      {
        rowKey: "g-status",
        sectionId: "admin-grp-status",
        icon: <ClockIcon size={16} />,
        section: (
          <FilterSection id="admin-grp-status">
            {restaurant.published !== false ? (
              <Button danger block onClick={() => setHideConfirm(true)}>
                Скрыть ресторан
              </Button>
            ) : (
              <Button
                type="primary"
                block
                onClick={() =>
                  setRestaurant((r) => ({ ...r, published: true }))
                }
              >
                Открыть
              </Button>
            )}
          </FilterSection>
        ),
      },
      {
        rowKey: "g-admins",
        sectionId: "admin-grp-admins",
        icon: <HashtagIcon size={16} />,
        section: (
          <FilterSection id="admin-grp-admins">
            <button
              type="button"
              aria-expanded={adminsOpen}
              className="w-full cursor-pointer rounded-lg border px-3 py-2.5 text-left text-sm font-medium [-webkit-tap-highlight-color:transparent] [border-color:var(--jm-color-border-secondary,#e8e8e8)] [color:var(--jm-color-text,rgba(0,0,0,0.88))] hover:[background:var(--jm-color-fill-quaternary,#fafafa)]"
              onClick={() => setAdminsOpen((o) => !o)}
            >
              Администраторы
            </button>
            {adminsOpen && (
              <div className="mt-2 flex flex-col gap-1">
                {admins.map((email, idx) => (
                  <div
                    key={email}
                    className="flex items-center gap-1 rounded-md px-2 py-1 [background:var(--jm-color-fill-quaternary,#fafafa)]"
                  >
                    <span className="min-w-0 flex-1 truncate text-sm [color:var(--jm-color-text,rgba(0,0,0,0.88))]">
                      {email}
                    </span>
                    <button
                      type="button"
                      aria-label="Удалить"
                      className="shrink-0 cursor-pointer border-none bg-transparent p-0 text-base leading-none text-[#ff4d4f] hover:opacity-70"
                      onClick={() =>
                        setAdmins((a) => a.filter((_, i) => i !== idx))
                      }
                    >
                      ×
                    </button>
                  </div>
                ))}
                <div className="mt-1 flex gap-1">
                  <Input
                    size="small"
                    placeholder="Email нового"
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && newAdminEmail.trim()) {
                        setAdmins((a) => [...a, newAdminEmail.trim()]);
                        setNewAdminEmail("");
                      }
                    }}
                  />
                  <Button
                    size="small"
                    type="default"
                    onClick={() => {
                      if (newAdminEmail.trim()) {
                        setAdmins((a) => [...a, newAdminEmail.trim()]);
                        setNewAdminEmail("");
                      }
                    }}
                  >
                    +
                  </Button>
                </div>
              </div>
            )}
          </FilterSection>
        ),
      },
      {
        rowKey: "g-advert",
        sectionId: "admin-grp-advert",
        icon: <SearchIcon size={16} />,
        section: (
          <FilterSection id="admin-grp-advert">
            <Button type="primary" href={`${advertBase}/fast-track`} block>
              Продвижение ресторана
            </Button>
          </FilterSection>
        ),
      },
      {
        rowKey: "g-save",
        sectionId: "admin-grp-save",
        icon: <StorefrontIcon size={16} />,
        section: (
          <FilterSection id="admin-grp-save">
            <Button
              type="primary"
              block
              loading={isSaving}
              onClick={handleSave}
            >
              Сохранить
            </Button>
          </FilterSection>
        ),
      },
    ],
    [
      admins,
      adminsOpen,
      advertBase,
      handleSave,
      isSaving,
      newAdminEmail,
      openAboutPanel,
      restaurant.published,
    ],
  );

  const aboutLayers = useMemo(
    (): CatalogFilterRailLayer[] => [
      {
        rowKey: "ab-name",
        sectionId: "admin-about-name",
        icon: <SearchIcon size={16} />,
        section: (
          <FilterSection id="admin-about-name" title="Название">
            <Input
              value={restaurant.name}
              onChange={(e) =>
                setRestaurant((r) => ({ ...r, name: e.target.value }))
              }
            />
          </FilterSection>
        ),
      },
      {
        rowKey: "ab-desc",
        sectionId: "admin-about-desc",
        icon: <HashtagIcon size={16} />,
        section: (
          <FilterSection id="admin-about-desc" title="Описание">
            <TextArea
              autoSize={{ minRows: 3, maxRows: 12 }}
              value={p?.description ?? ""}
              onChange={(e) =>
                setRestaurant((r) => ({
                  ...r,
                  preview: {
                    ...(r.preview ?? { images: [] }),
                    description: e.target.value,
                  },
                }))
              }
            />
          </FilterSection>
        ),
      },
      {
        rowKey: "ab-addr",
        sectionId: "admin-about-addr",
        icon: <MapPinIcon size={16} />,
        section: (
          <FilterSection id="admin-about-addr" title="Адрес">
            <AddressPickerField
              yandexMapsApiKey={yandexMapsApiKey}
              value={p?.address ?? ""}
              onChange={(address) =>
                setRestaurant((r) => ({
                  ...r,
                  preview: { ...(r.preview ?? { images: [] }), address },
                }))
              }
            />
          </FilterSection>
        ),
      },
      {
        rowKey: "ab-hours",
        sectionId: "admin-about-hours",
        icon: <ClockIcon size={16} />,
        section: (
          <FilterSection id="admin-about-hours" title="Расписание">
            <WeekHoursPicker value={hours} onChange={setHours} />
          </FilterSection>
        ),
      },
    ],
    [hours, p?.address, p?.description, restaurant.name, yandexMapsApiKey],
  );

  const mobileTopBar = useCallback(
    ({
      toggleAsideDrawer,
      asideDrawerOpen,
      asideRegionDomId,
    }: NavListMobileAsideControls) => (
      <div className="flex min-w-0 flex-1 items-center justify-end">
        <Button
          type="default"
          className="shrink-0 px-3"
          aria-expanded={asideDrawerOpen}
          aria-controls={asideRegionDomId}
          aria-label={
            asideDrawerOpen ? "Закрыть настройки" : "Редактировать ресторан"
          }
          onMouseDown={(e) => e.preventDefault()}
          onClick={toggleAsideDrawer}
        >
          Редактировать
        </Button>
      </div>
    ),
    [],
  );

  const sidebarBody = (
    <AdminRail
      asidePanel={asidePanel}
      mainLayers={mainLayers}
      aboutLayers={aboutLayers}
      onSaveAbout={() => {
        aboutSnapshotRef.current = {
          restaurant: cloneRestaurant(restaurant),
          hours: { ...hours },
        };
        setAsidePanel("settings");
      }}
      onCancelAbout={() => setAboutCancelConfirm(true)}
      onDeleteRestaurant={() => setDeleteRestaurantConfirm(true)}
    />
  );

  const images = p?.images ?? [];

  const mainContent = (
    <div className="mx-auto w-full max-w-[min(760px,100%)] pb-8">
      <div className="mb-6">
        <ImageCarousel
          images={images}
          label={restaurant.name}
          keyPrefix={`admin-${restaurant.id}`}
          editMode
          onSlideActivate={updateImage}
          onEditDeleteSlide={deleteImage}
          onEditAddSlide={addImage}
        />
      </div>

      <div className="mb-3 flex flex-row flex-wrap items-baseline gap-x-[14px] gap-y-2.5">
        {p?.rating != null ? (
          <span className="whitespace-nowrap text-[1.15rem] font-semibold text-black/65">
            ⭐ {p.rating}
          </span>
        ) : null}
        <Typography.Title level={1} className="!m-0">
          {restaurant.name}
        </Typography.Title>
      </div>
      <Typography.Paragraph className="!text-[1.1rem] !text-[#666]">
        {p?.description}
      </Typography.Paragraph>
      <div className="mb-6 flex flex-wrap items-center gap-4 text-[0.95rem] text-[#666]">
        {p?.city ? <Typography.Text>{p.city}</Typography.Text> : null}
        {p?.address ? (
          <Typography.Text type="secondary">{p.address}</Typography.Text>
        ) : null}
      </div>

      {restaurant.mainSections?.map((section: RestaurantMainSection) => (
        <div key={section.id} className="mb-8">
          <Typography.Title level={2} className="!mb-4">
            {section.title ?? "Меню"}
          </Typography.Title>
          {section.divisions.map((division) => (
            <div key={division.id} className="mb-6">
              <div className="mb-3 flex items-center gap-2">
                <Input
                  className="!text-lg !font-semibold"
                  value={division.title ?? ""}
                  onChange={(e) =>
                    renameDivision(section.id, division.id, e.target.value)
                  }
                />
                <button
                  type="button"
                  className="shrink-0 cursor-pointer border-none bg-transparent p-0 text-sm text-[#ff4d4f] hover:underline"
                  onClick={() => deleteDivision(section.id, division.id)}
                >
                  Удалить
                </button>
              </div>
              <div className="grid gap-3">
                {division.blocks.map((block) => {
                  const dishImages = getContentBlockImages(block);
                  return (
                    <div
                      key={block.id}
                      id={block.id}
                      className="relative rounded-xl border border-solid p-3 [border-color:var(--jm-color-border-secondary,#f0f0f0)] [background:var(--jm-color-bg-container,#fff)] shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
                    >
                      <div className="mb-3 overflow-hidden rounded-[10px]">
                        <ImageCarousel
                          images={dishImages}
                          label={block.title}
                          keyPrefix={`dish-${block.id}`}
                          editMode
                          compact
                          listCard
                          onSlideActivate={(idx) => {
                            const u = window.prompt(
                              "URL изображения",
                              dishImages[idx] ?? "",
                            );
                            if (u != null) {
                              const next = [...dishImages];
                              next[idx] = u;
                              updateBlock(
                                section.id,
                                division.id,
                                block.id,
                                patchBlockImagesFromUrls(next),
                              );
                            }
                          }}
                          onEditDeleteSlide={(idx) => {
                            const next = dishImages.filter((_, i) => i !== idx);
                            updateBlock(
                              section.id,
                              division.id,
                              block.id,
                              patchBlockImagesFromUrls(next),
                            );
                          }}
                          onEditAddSlide={() => {
                            const u = window.prompt("URL нового изображения");
                            if (u?.trim()) {
                              updateBlock(
                                section.id,
                                division.id,
                                block.id,
                                patchBlockImagesFromUrls([
                                  ...dishImages,
                                  u.trim(),
                                ]),
                              );
                            }
                          }}
                        />
                      </div>
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <Input
                          className="min-w-0 flex-1 max-w-lg font-semibold"
                          value={block.title}
                          onChange={(e) =>
                            updateBlock(section.id, division.id, block.id, {
                              title: e.target.value,
                            })
                          }
                        />
                        <button
                          type="button"
                          className="shrink-0 cursor-pointer border-none bg-transparent p-0 text-sm text-[#ff4d4f] hover:underline"
                          onClick={() =>
                            removeBlock(section.id, division.id, block.id)
                          }
                        >
                          Удалить
                        </button>
                      </div>
                      {division.title?.trim() ? (
                        <p className="mb-2 text-[13px] [color:var(--jm-color-text-secondary,rgba(0,0,0,0.55))]">
                          {division.title}
                        </p>
                      ) : null}
                      <div className="mt-1 flex flex-wrap gap-2">
                        <Input
                          size="small"
                          className="max-w-[160px]"
                          placeholder="Цена"
                          addonAfter="₽"
                          value={parsePriceNumber(block.subtitle)}
                          onChange={(e) =>
                            updateBlock(section.id, division.id, block.id, {
                              subtitle: formatPriceSubtitle(e.target.value),
                            })
                          }
                        />
                        <Input
                          className="min-w-[200px] flex-1"
                          placeholder="Описание"
                          value={block.extraText ?? ""}
                          onChange={(e) =>
                            updateBlock(section.id, division.id, block.id, {
                              extraText: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              <Button
                type="default"
                className="mt-2"
                onClick={() => addBlock(section.id, division.id)}
              >
                Добавить позицию
              </Button>
            </div>
          ))}
          <Button
            type="dashed"
            block
            className="mt-2"
            onClick={() => addDivision(section.id)}
          >
            Добавить раздел
          </Button>
        </div>
      ))}
    </div>
  );

  return (
    <PageContentShell className="min-h-0 flex-1">
      <CatalogPageLayout
        includeSiteChrome={false}
        relaxContentInnerWidth
        mobileTopBar={mobileTopBar}
        sidebarAriaLabel="Настройки ресторана"
        sidebarClassName="overflow-x-visible"
        sidebarBody={sidebarBody}
      >
        {mainContent}
      </CatalogPageLayout>

      <AppConfirmModal
        open={hideConfirm}
        title="Скрыть ресторан?"
        okText="Скрыть"
        cancelText="Отмена"
        okDanger
        onOk={() => {
          setRestaurant((r) => ({ ...r, published: false }));
          setHideConfirm(false);
        }}
        onCancel={() => setHideConfirm(false)}
      >
        Ресторан будет скрыт из поиска и каталога для пользователей.
      </AppConfirmModal>

      <AppConfirmModal
        open={deleteRestaurantConfirm}
        title="Удалить ресторан?"
        okText="Удалить"
        cancelText="Отмена"
        okDanger
        onOk={handleDeleteRestaurant}
        onCancel={() => setDeleteRestaurantConfirm(false)}
      >
        Это действие необратимо. Ресторан, его меню и все данные будут удалены
        навсегда.
      </AppConfirmModal>

      <AppConfirmModal
        open={aboutCancelConfirm}
        title="Отменить изменения?"
        okText="Отменить"
        cancelText="Нет"
        okDanger
        onOk={() => {
          const snap = aboutSnapshotRef.current;
          if (snap) {
            setRestaurant(cloneRestaurant(snap.restaurant));
            setHours({ ...snap.hours });
          }
          setAboutCancelConfirm(false);
          setAsidePanel("settings");
        }}
        onCancel={() => setAboutCancelConfirm(false)}
      >
        Выйти из редактирования без сохранения внесённых правок?
      </AppConfirmModal>
    </PageContentShell>
  );
}
