'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DownloadSimple,
  EnvelopeSimple,
  FacebookLogo,
  ImageSquare,
  LinkSimple,
  MessengerLogo,
  ShareNetwork,
  TelegramLogo,
  WhatsappLogo,
  XLogo,
} from '@phosphor-icons/react';
import { Xmark } from 'iconoir-react';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  canShareImageFile,
  canUseNativeShare,
  copyText,
  downloadBlob,
  isInAppBrowser,
  openShareTarget,
  resolveShareLaunch,
  ShareChannelId,
  SharePayload,
} from '@/lib/shareLinks';
import { getDisplayHost, getSiteUrl } from '@/lib/siteUrl';
import { OfferingSlotConfig } from '@/types/krathong';

interface ShareInviteSheetProps {
  isOpen: boolean;
  // The player's offerings from the round just floated; empty for a general invitation
  offerings: OfferingSlotConfig[];
  onClose: () => void;
}

type CardResult =
  | { key: string; status: 'ready'; file: File; previewUrl: string }
  | { key: string; status: 'error' };

const CARD_FILENAME = 'loy-kra-ter-card.png';
const TOAST_VISIBLE_MS = 3600;

const LineLogo: React.FC<{ size?: number }> = ({ size = 22 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
    <rect x="1.5" y="1.5" width="21" height="21" rx="5" fill="#06C755" />
    <path
      d="M12 5.4c-4.2 0-7.6 2.7-7.6 6.1 0 3 2.7 5.6 6.4 6 .25.06.6.17.68.39.08.2.05.5.03.7l-.11.66c-.03.2-.16.77.67.42.83-.35 4.5-2.65 6.13-4.54 1.13-1.24 1.67-2.5 1.67-3.63 0-3.4-3.4-6.1-7.6-6.1Z"
      fill="#FFFFFF"
    />
    <path
      d="M7.6 9.9v3.3h1.9M10.4 9.9v3.3M11.9 13.2V9.9l2.1 3.3V9.9M17 9.9h-1.9v3.3H17M15.1 11.55h1.7"
      fill="none"
      stroke="#06C755"
      strokeWidth="0.85"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const ShareInviteSheet: React.FC<ShareInviteSheetProps> = ({
  isOpen,
  offerings,
  onClose,
}) => {
  const { locale, t } = useLanguage();
  const [cardResult, setCardResult] = useState<CardResult | null>(null);
  const [renderNonce, setRenderNonce] = useState<number>(0);
  const [toast, setToast] = useState<string | null>(null);
  const [showLongPressHint, setShowLongPressHint] = useState<boolean>(false);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previewUrlRef = useRef<string | null>(null);
  const paintedKeyRef = useRef<string | null>(null);

  const siteUrl = useMemo(() => (isOpen ? `${getSiteUrl()}/` : ''), [isOpen]);
  const renderKey = `${locale}|${renderNonce}|${JSON.stringify(offerings)}`;
  const card = cardResult?.key === renderKey ? cardResult : null;

  const payload = useMemo<SharePayload>(
    () => ({ url: siteUrl, title: t.share.shareTitle, text: t.share.inviteText }),
    [siteUrl, t]
  );

  const showToast = useCallback((message: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast(message);
    toastTimerRef.current = setTimeout(() => setToast(null), TOAST_VISIBLE_MS);
  }, []);

  useEffect(
    () => () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    },
    []
  );

  useEffect(
    () => () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    },
    []
  );

  // Paint the invite card off-screen when the sheet opens, the language flips or the offerings change;
  // reopening with the same content reuses the last card
  useEffect(() => {
    if (!isOpen || !siteUrl || paintedKeyRef.current === renderKey) return;
    let cancelled = false;

    import('@/lib/shareCard')
      .then(({ renderStoryCard }) =>
        renderStoryCard({
          locale,
          offerings,
          url: siteUrl,
          labels: t.share.card,
        })
      )
      .then((blob) => {
        if (cancelled) return;
        if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
        const previewUrl = URL.createObjectURL(blob);
        previewUrlRef.current = previewUrl;
        paintedKeyRef.current = renderKey;
        setCardResult({
          key: renderKey,
          status: 'ready',
          file: new File([blob], CARD_FILENAME, { type: 'image/png' }),
          previewUrl,
        });
      })
      .catch(() => {
        if (!cancelled) setCardResult({ key: renderKey, status: 'error' });
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, siteUrl, locale, offerings, t, renderKey]);

  // Capture phase so Escape closes only this sheet, not the blessing modal underneath
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      e.stopPropagation();
      onClose();
    };
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen, onClose]);

  const handleCopyLink = async () => {
    const copied = await copyText(payload.url);
    showToast(copied ? t.share.toastCopied : t.share.toastCopyFailed);
  };

  const handleChannel = (channel: ShareChannelId) => {
    const launch = resolveShareLaunch(channel, payload);
    if (launch.kind === 'copy') {
      void copyText(payload.url).then((copied) =>
        showToast(copied ? t.share.toastMessenger : t.share.toastCopyFailed)
      );
      return;
    }
    // Open synchronously: Safari blocks popups that follow an await
    openShareTarget(launch.href);
    if (launch.copyFirst) {
      void copyText(payload.url).then((copied) => {
        if (copied) showToast(t.share.toastMessenger);
      });
    }
  };

  const saveCard = (file: File) => {
    if (isInAppBrowser()) setShowLongPressHint(true);
    downloadBlob(file, CARD_FILENAME);
    void copyText(payload.url);
    showToast(t.share.toastSaved);
  };

  // Shares the card image with the invite text and link, for chats and timelines
  const handleShareCard = async () => {
    if (card?.status !== 'ready') return;

    if (!canShareImageFile(card.file)) {
      saveCard(card.file);
      return;
    }

    // Start the copy inside the tap, then share right away so the gesture isn't spent
    const copying = copyText(payload.url);
    try {
      await navigator.share({
        files: [card.file],
        title: payload.title,
        text: `${payload.text} ${payload.url}`,
      });
      if (await copying) showToast(t.share.toastCardShared);
    } catch (error) {
      if ((error as DOMException)?.name === 'AbortError') return;
      saveCard(card.file);
    }
  };

  const handleNativeShare = async () => {
    try {
      await navigator.share({ title: payload.title, text: payload.text, url: payload.url });
    } catch (error) {
      if ((error as DOMException)?.name !== 'AbortError') void handleCopyLink();
    }
  };

  const linkChannels: {
    id: ShareChannelId;
    label: string;
    icon: React.ReactNode;
  }[] = [
    { id: 'line', label: 'LINE', icon: <LineLogo /> },
    {
      id: 'facebook',
      label: 'Facebook',
      icon: <FacebookLogo size={22} weight="fill" color="#1877F2" />,
    },
    {
      id: 'messenger',
      label: 'Messenger',
      icon: <MessengerLogo size={22} weight="fill" color="#3DA1FF" />,
    },
    {
      id: 'whatsapp',
      label: 'WhatsApp',
      icon: <WhatsappLogo size={22} weight="fill" color="#25D366" />,
    },
    {
      id: 'telegram',
      label: 'Telegram',
      icon: <TelegramLogo size={22} weight="fill" color="#2AABEE" />,
    },
    { id: 'x', label: 'X', icon: <XLogo size={20} weight="bold" color="#FFFDF7" /> },
    {
      id: 'email',
      label: t.share.emailLabel,
      icon: <EnvelopeSimple size={22} weight="duotone" color="#F4D06F" />,
    },
  ];

  const tileClass =
    'thai-chamfer-sm flex cursor-pointer flex-col items-center justify-center gap-1.5 border border-[#D4AF37]/30 bg-[#080B14]/90 px-1 py-2.5 transition-colors hover:border-[#FFF275]/80 hover:bg-[#12172B] disabled:cursor-not-allowed disabled:opacity-45';
  const tileLabelClass =
    'font-heading max-w-full truncate text-[10px] font-medium text-[#FFFDF7]/80';

  const cardReady = card?.status === 'ready';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="pointer-events-auto fixed inset-0 z-[60] flex items-center justify-center bg-[#060810]/85 p-2.5 backdrop-blur-md sm:p-4"
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, y: 60, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 100, damping: 15 }}
            role="dialog"
            aria-modal="true"
            aria-label={t.nav.invite}
            className="thai-chamfer relative grid max-h-[calc(100dvh-1.25rem)] w-full max-w-3xl grid-cols-1 overflow-y-auto border border-[#D4AF37]/60 bg-[#0E1222] text-[#FFFDF7] shadow-[0_30px_90px_rgba(0,0,0,0.92),0_18px_50px_rgba(244,208,111,0.18)] [zoom:var(--ui-zoom,1)] sm:max-h-[calc(min(92dvh,52rem)/var(--ui-zoom,1))] md:grid-cols-12"
          >
            <button
              type="button"
              onClick={onClose}
              aria-label={t.share.closeBtn}
              title={t.share.closeBtn}
              className="absolute top-2.5 right-2.5 z-20 flex h-9 w-9 cursor-pointer items-center justify-center border border-[#D4AF37]/50 bg-[#080B14]/90 text-[#FFFDF7]/85 transition-colors hover:border-[#FFF275] hover:text-[#FFF275]"
            >
              <Xmark width={18} height={18} strokeWidth={1.8} />
            </button>

            {/* Invite card preview */}
            <div className="order-2 flex flex-col items-center gap-3 border-t border-[#D4AF37]/30 bg-[#080B14] p-4 sm:p-6 md:order-1 md:col-span-5 md:border-t-0 md:border-r">
              <p className="font-heading hidden self-start text-[11px] font-medium tracking-wider text-[#F4D06F] md:block">
                {t.share.cardSection}
              </p>

              <div className="relative aspect-[9/16] w-40 overflow-hidden border border-[#D4AF37]/45 bg-[#0D1321] shadow-[0_18px_40px_rgba(0,0,0,0.7)] min-[420px]:w-48 md:w-full md:max-w-60">
                {cardReady ? (
                  // eslint-disable-next-line @next/next/no-img-element -- local blob preview, nothing for next/image to optimise
                  <img
                    src={card.previewUrl}
                    alt={t.share.cardSection}
                    className="h-full w-full object-cover"
                  />
                ) : card?.status === 'error' ? (
                  <div className="flex h-full flex-col items-center justify-center gap-3 p-4 text-center">
                    <p className="font-heading text-xs text-[#FFFDF7]/75">
                      {t.share.cardFailed}
                    </p>
                    <button
                      type="button"
                      onClick={() => setRenderNonce((n) => n + 1)}
                      className="thai-chamfer-sm font-heading cursor-pointer border border-[#D4AF37]/60 px-3 py-1.5 text-[11px] text-[#FFF275] transition-colors hover:bg-[#12172B]"
                    >
                      {t.share.cardRetryBtn}
                    </button>
                  </div>
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-3">
                    <motion.div
                      animate={{ opacity: [0.35, 1, 0.35], scale: [0.92, 1.05, 0.92] }}
                      transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                      className="h-10 w-10 rounded-full bg-[radial-gradient(circle_at_40%_36%,#FFFDE8_0%,#FFF275_45%,#F4C542_100%)] shadow-[0_0_28px_rgba(255,242,117,0.6)]"
                    />
                    <p className="font-heading text-[11px] text-[#F4D06F]/80">
                      {t.share.cardRendering}
                    </p>
                  </div>
                )}
              </div>

              <p className="font-heading text-center text-[10px] leading-relaxed text-pretty text-[#FFFDF7]/60">
                {t.share.cardHint}
              </p>
              {showLongPressHint && (
                <p className="font-heading text-center text-[11px] text-[#FFF275]">
                  {t.share.longPressHint}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="order-1 flex flex-col gap-4 bg-[linear-gradient(160deg,rgba(24,30,58,0.98)_0%,rgba(13,17,34,0.99)_100%)] p-4 sm:p-6 md:order-2 md:col-span-7">
              <div className="border-b border-[#D4AF37]/30 pr-11 pb-3 md:pr-10">
                <p className="font-heading text-[11px] font-medium tracking-wider text-[#F4D06F]">
                  {t.share.headerTag}
                </p>
                <h2 className="font-display mt-0.5 text-lg leading-snug text-balance text-[#FFF275] sm:text-2xl">
                  {t.share.title}
                </h2>
              </div>

              <div className="flex flex-col gap-2.5">
                <p className="font-heading text-[11px] font-medium tracking-wider text-[#F4D06F]">
                  {t.share.linkSection}
                </p>

                <div className="grid grid-cols-4 gap-2">
                  {linkChannels.map((channel) => (
                    <button
                      key={channel.id}
                      type="button"
                      onClick={() => handleChannel(channel.id)}
                      className={tileClass}
                    >
                      {channel.icon}
                      <span className={tileLabelClass}>{channel.label}</span>
                    </button>
                  ))}
                  {canUseNativeShare() && (
                    <button type="button" onClick={handleNativeShare} className={tileClass}>
                      <ShareNetwork size={22} weight="duotone" color="#F4D06F" />
                      <span className={tileLabelClass}>{t.share.moreAppsBtn}</span>
                    </button>
                  )}
                </div>

                <div className="flex items-stretch gap-2">
                  <div className="font-heading flex min-w-0 flex-1 items-center border border-[#D4AF37]/40 bg-[#12172B] px-3 text-xs text-[#F4D06F] select-all">
                    <span className="truncate">{getDisplayHost(payload.url)}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="thai-chamfer-sm font-heading flex shrink-0 cursor-pointer items-center gap-1.5 border border-[#D4AF37]/60 bg-[#B83B2A] px-3.5 py-2.5 text-xs font-medium whitespace-nowrap text-[#FFFDF7] transition-colors hover:bg-[#D4AF37] hover:text-[#0B0E17]"
                  >
                    <LinkSimple size={15} weight="bold" />
                    <span>{t.share.copyLinkBtn}</span>
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-2.5 border-t border-[#D4AF37]/25 pt-3.5">
                <p className="font-heading text-[11px] font-medium tracking-wider text-[#F4D06F]">
                  {t.share.cardSection}
                </p>
                <div className="grid grid-cols-1 gap-2 min-[420px]:grid-cols-2">
                  <button
                    type="button"
                    onClick={handleShareCard}
                    disabled={!cardReady}
                    className="thai-chamfer-sm font-heading flex cursor-pointer items-center justify-center gap-2 border border-[#FFF275]/60 bg-[#D4AF37] px-3 py-2.5 text-xs font-semibold whitespace-nowrap text-[#0B0E17] transition-colors hover:bg-[#FFF275] disabled:cursor-wait disabled:opacity-55"
                  >
                    <ImageSquare size={17} weight="bold" />
                    <span>{t.share.cardShareBtn}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => cardReady && saveCard(card.file)}
                    disabled={!cardReady}
                    className="thai-chamfer-sm font-heading flex cursor-pointer items-center justify-center gap-2 border border-[#D4AF37]/50 bg-[#080B14] px-3 py-2.5 text-xs font-medium whitespace-nowrap text-[#FFF275] transition-colors hover:border-[#FFF275] hover:bg-[#12172B] disabled:cursor-wait disabled:opacity-55"
                  >
                    <DownloadSimple size={16} weight="bold" />
                    <span>{t.share.cardSaveBtn}</span>
                  </button>
                </div>
              </div>
            </div>

            <AnimatePresence>
              {toast && (
                <motion.div
                  key={toast}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 12 }}
                  role="status"
                  className="thai-chamfer-sm font-heading pointer-events-none sticky bottom-3 z-30 mx-auto mb-3 w-[calc(100%-1.5rem)] max-w-md border border-[#52B788]/50 bg-[#0B1F18]/95 px-4 py-2.5 text-center text-xs text-[#FFF275] shadow-[0_12px_30px_rgba(0,0,0,0.6)] order-3 md:col-span-12"
                >
                  {toast}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
