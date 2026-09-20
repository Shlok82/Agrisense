import { Modal } from './ui/Modal.jsx'
import { Button } from './ui/Button.jsx'
import { useConsent, useI18n } from '../context/AppProviders.jsx'

export function ConsentModal() {
  const { consent, setConsent } = useConsent()
  const { t } = useI18n()
  const open = !consent

  return (
    <Modal
      open={open}
      onClose={() => {}}
      title={t('consent.title')}
      describedBy="consent-copy"
    >
      <p id="consent-copy" className="text-sm leading-relaxed text-black/80 dark:text-white/80">
        {t('consent.body')}
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Button type="button" onClick={() => setConsent(true)} aria-label={t('consent.agree')}>
          {t('consent.agree')}
        </Button>
      </div>
    </Modal>
  )
}
