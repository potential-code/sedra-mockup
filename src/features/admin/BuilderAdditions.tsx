import type { CourseId, Lang } from '@shared/types'
import {
  BookOpen,
  ChevronDown,
  Clapperboard,
  type LucideIcon,
  MessageCircleQuestion,
  Pencil,
  Plus,
  Save,
  Sparkles,
  Trash2,
} from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { SelectField, StatusLabel, TextField } from '@/components/admin/AdminUi'
import { useContentLang } from '@/components/admin/ContentLangSwitch'
import { announce } from '@/components/shared/LiveRegion'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  addBlock,
  addUnit,
  removeAddedUnit,
  removeBlock,
  updateBlock,
  useAddedBlocks,
} from '@/store/admin-content'
import type { AddedBlock, AddedUnit, BlockType } from '@/store/db'

/** Learning block types SEDRA can add in the demo (same kinds the learner unit uses). */
export const BLOCK_TYPES: { type: BlockType; icon: LucideIcon }[] = [
  { type: 'video', icon: Clapperboard },
  { type: 'text', icon: BookOpen },
  { type: 'question', icon: MessageCircleQuestion },
  { type: 'practice', icon: Sparkles },
]
const ICON: Record<BlockType, LucideIcon> = {
  video: Clapperboard,
  text: BookOpen,
  question: MessageCircleQuestion,
  practice: Sparkles,
}

type DraftBlock = { key: number; type: BlockType; title: string; description: string }

const DIALOG_CLS = 'max-h-[92dvh] overflow-y-auto rounded-2xl bg-white p-5 sm:max-w-2xl sm:p-6'

/** Fields for one learning block: type, title, description. */
function BlockFields({
  idPrefix,
  block,
  onChange,
  titleError,
  dir,
}: {
  idPrefix: string
  block: Omit<DraftBlock, 'key'>
  onChange: (b: Partial<Omit<DraftBlock, 'key'>>) => void
  titleError?: string
  dir: 'ltr' | 'rtl'
}) {
  const { t } = useTranslation('admin')
  return (
    <div className="grid gap-4">
      <SelectField
        id={`${idPrefix}-type`}
        label={t('add.blockType')}
        value={block.type}
        onChange={(v) => onChange({ type: v as BlockType })}
        options={BLOCK_TYPES.map((b) => ({ value: b.type, label: t(`add.types.${b.type}`) }))}
      />
      <TextField
        id={`${idPrefix}-title`}
        label={t('add.blockTitle')}
        value={block.title}
        onChange={(v) => onChange({ title: v })}
        error={titleError}
        dir={dir}
        required
      />
      <TextField
        id={`${idPrefix}-desc`}
        label={t('add.blockDescription')}
        value={block.description}
        onChange={(v) => onChange({ description: v })}
        multiline
        rows={2}
        dir={dir}
      />
    </div>
  )
}

/** Popup: add a unit with a title, description and one or more learning blocks (demo only). */
export function AddUnitDialog({ courseId, lang }: { courseId: CourseId; lang: Lang }) {
  const { t } = useTranslation('admin')
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [blocks, setBlocks] = useState<DraftBlock[]>([])
  const [errors, setErrors] = useState<{ title?: boolean; blocks?: number[] }>({})
  const dir = lang === 'ar' ? 'rtl' : 'ltr'

  function onOpenChange(next: boolean) {
    if (next) {
      setTitle('')
      setDescription('')
      setBlocks([{ key: 1, type: 'video', title: '', description: '' }])
      setErrors({})
    }
    setOpen(next)
  }

  function onSave() {
    const badBlocks = blocks.filter((b) => !b.title.trim()).map((b) => b.key)
    const e = { title: !title.trim(), blocks: badBlocks }
    setErrors(e)
    if (e.title || badBlocks.length > 0) {
      const target = e.title ? 'au-title' : `au-b${badBlocks[0]}-title`
      requestAnimationFrame(() => document.getElementById(target)?.focus())
      return
    }
    addUnit({
      courseId,
      lang,
      title: title.trim(),
      description: description.trim(),
      blocks: blocks.map(({ type, title: bt, description: bd }) => ({
        type,
        title: bt.trim(),
        description: bd.trim(),
      })),
    })
    toast.success(t('add.unitSaved'), { description: t('add.demoOnly') })
    announce(t('add.unitSaved'))
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus aria-hidden="true" />
          {t('add.unit')}
        </Button>
      </DialogTrigger>
      <DialogContent className={DIALOG_CLS}>
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault()
            onSave()
          }}
          className="flex flex-col gap-5"
        >
          <div className="flex flex-col gap-2 pe-12">
            <DialogTitle asChild>
              <h2 className="m-0 text-2xl">{t('add.unitTitle')}</h2>
            </DialogTitle>
            <DialogDescription className="text-base text-ink-soft">
              {t('add.unitIntro', { lang: t(`editor.lang.${lang}`) })}
            </DialogDescription>
          </div>
          <TextField
            id="au-title"
            label={t('add.title')}
            value={title}
            onChange={setTitle}
            error={errors.title ? t('builder.settingsRequired') : undefined}
            dir={dir}
            required
          />
          <TextField
            id="au-desc"
            label={t('add.description')}
            value={description}
            onChange={setDescription}
            multiline
            rows={2}
            dir={dir}
          />
          <fieldset className="m-0 flex flex-col gap-3 border-0 p-0">
            <legend className="mb-1 p-0 text-lg font-semibold text-ink">
              {t('add.blocksHeading')}
            </legend>
            <ol className="m-0 flex list-none flex-col gap-3 p-0">
              {blocks.map((b, i) => (
                <li
                  key={b.key}
                  className="flex max-w-none flex-col gap-3 rounded-2xl border border-sedra-pale bg-sedra-pale-50 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="m-0 font-semibold text-sedra-green">
                      {t('add.blockN', { n: i + 1 })}
                    </p>
                    {blocks.length > 1 ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setBlocks((s) => s.filter((x) => x.key !== b.key))}
                        aria-label={t('add.removeBlockN', { n: i + 1 })}
                      >
                        <Trash2 aria-hidden="true" />
                        {t('add.remove')}
                      </Button>
                    ) : null}
                  </div>
                  <BlockFields
                    idPrefix={`au-b${b.key}`}
                    block={b}
                    dir={dir}
                    titleError={
                      errors.blocks?.includes(b.key) ? t('builder.settingsRequired') : undefined
                    }
                    onChange={(patch) =>
                      setBlocks((s) => s.map((x) => (x.key === b.key ? { ...x, ...patch } : x)))
                    }
                  />
                </li>
              ))}
            </ol>
            <Button
              type="button"
              variant="outline"
              className="self-start"
              onClick={() =>
                setBlocks((s) => [
                  ...s,
                  {
                    key: Math.max(0, ...s.map((x) => x.key)) + 1,
                    type: 'text',
                    title: '',
                    description: '',
                  },
                ])
              }
            >
              <Plus aria-hidden="true" />
              {t('add.anotherBlock')}
            </Button>
          </fieldset>
          <div className="flex flex-wrap gap-3">
            <Button type="submit">
              <Save aria-hidden="true" />
              {t('add.saveUnit')}
            </Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              {t('common.cancel')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

/** Popup: add one learning block to a unit (built-in or added). */
export function AddBlockDialog({
  unitId,
  unitTitle,
  lang,
  existing,
}: {
  unitId: string
  unitTitle: string
  lang: Lang
  /** Edit this block instead of adding a new one. */
  existing?: AddedBlock
}) {
  const { t } = useTranslation('admin')
  const [open, setOpen] = useState(false)
  const [block, setBlock] = useState<Omit<DraftBlock, 'key'>>({
    type: 'text',
    title: '',
    description: '',
  })
  const [titleError, setTitleError] = useState(false)
  const dir = lang === 'ar' ? 'rtl' : 'ltr'
  const prefix = existing ? `eb-${existing.id}` : `ab-${unitId}`

  function onOpenChange(next: boolean) {
    if (next) {
      setBlock(
        existing
          ? { type: existing.type, title: existing.title, description: existing.description }
          : { type: 'text', title: '', description: '' },
      )
      setTitleError(false)
    }
    setOpen(next)
  }

  function onSave() {
    if (!block.title.trim()) {
      setTitleError(true)
      requestAnimationFrame(() => document.getElementById(`${prefix}-title`)?.focus())
      return
    }
    const clean = {
      type: block.type,
      title: block.title.trim(),
      description: block.description.trim(),
    }
    if (existing) updateBlock(unitId, { ...existing, ...clean })
    else addBlock(unitId, clean)
    const msg = existing ? t('add.blockUpdated') : t('add.blockSaved')
    toast.success(msg, { description: t('add.demoOnly') })
    announce(msg)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {existing ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            aria-label={t('add.editNamed', { title: existing.title })}
          >
            <Pencil aria-hidden="true" />
            {t('builder.edit')}
          </Button>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="self-start"
            aria-label={t('add.blockFor', { title: unitTitle })}
          >
            <Plus aria-hidden="true" />
            {t('add.block')}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className={DIALOG_CLS}>
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault()
            onSave()
          }}
          className="flex flex-col gap-5"
        >
          <div className="flex flex-col gap-2 pe-12">
            <DialogTitle asChild>
              <h2 className="m-0 text-2xl">
                {existing ? t('add.editBlock') : t('add.blockFor', { title: unitTitle })}
              </h2>
            </DialogTitle>
            <DialogDescription className="text-base text-ink-soft">
              {t('add.blockIntro', { lang: t(`editor.lang.${lang}`) })}
            </DialogDescription>
          </div>
          <BlockFields
            idPrefix={prefix}
            block={block}
            dir={dir}
            titleError={titleError ? t('builder.settingsRequired') : undefined}
            onChange={(patch) => setBlock((s) => ({ ...s, ...patch }))}
          />
          <div className="flex flex-wrap gap-3">
            <Button type="submit">
              <Save aria-hidden="true" />
              {existing ? t('builder.settingsSave') : t('add.saveBlock')}
            </Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              {t('common.cancel')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

/** Blocks added in the demo, shown under a unit's built-in blocks. */
export function AddedBlockList({ unitId, startAt }: { unitId: string; startAt: number }) {
  const { t } = useTranslation('admin')
  const blocks = useAddedBlocks(unitId)
  if (blocks.length === 0) return null
  return (
    <ol start={startAt} className="m-0 flex list-none flex-col gap-2 p-0">
      {blocks.map((b, i) => (
        <BlockRow
          key={b.id}
          unitId={unitId}
          block={b}
          n={startAt + i}
          onRemove={() => {
            removeBlock(unitId, b.id)
            announce(t('add.blockRemoved'))
          }}
        />
      ))}
    </ol>
  )
}

function BlockRow({
  unitId,
  block,
  n,
  onRemove,
}: {
  unitId: string
  block: AddedBlock
  n: number
  onRemove: () => void
}) {
  const lang = useContentLang()
  const { t } = useTranslation('admin')
  const Icon = ICON[block.type]
  return (
    <li className="flex max-w-none items-start gap-3 rounded-xl border border-dashed border-sedra-mid/60 bg-white p-3">
      <Icon
        aria-hidden="true"
        className="mt-0.5 size-7 shrink-0 text-sedra-green"
        strokeWidth={1.75}
      />
      <span className="grid min-w-0 flex-1 basis-48 gap-0.5">
        <span className="font-semibold text-ink">
          {n}. {block.title}{' '}
          <span className="font-normal text-ink-soft">({t(`add.types.${block.type}`)})</span>
        </span>
        {block.description ? (
          <span className="text-base text-ink-soft">{block.description}</span>
        ) : null}
        <StatusLabel tone="info" className="mt-1">
          {t('add.addedTag')}
        </StatusLabel>
      </span>
      <div className="flex flex-wrap gap-2">
        <AddBlockDialog unitId={unitId} unitTitle={block.title} lang={lang} existing={block} />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onRemove}
          aria-label={t('add.removeNamed', { title: block.title })}
        >
          <Trash2 aria-hidden="true" />
          {t('add.remove')}
        </Button>
      </div>
    </li>
  )
}

/** A unit SEDRA added in the demo: same card shape as built-in units, marked as added. */
export function AddedUnitCard({
  unit,
  order,
  lang,
}: {
  unit: AddedUnit
  order: number
  lang: Lang
}) {
  const { t } = useTranslation('admin')
  const id = `au-${unit.id}`
  const dir = unit.lang === 'ar' ? 'rtl' : 'ltr'
  return (
    <article
      aria-labelledby={id}
      className="overflow-hidden rounded-2xl border border-dashed border-sedra-mid/70 bg-white shadow-sm"
    >
      <div className="flex flex-wrap items-start gap-3 p-4">
        <div className="flex min-w-0 flex-1 basis-64 flex-col gap-2">
          <p className="m-0 text-sm font-semibold text-ink-soft">
            {t('builder.unitN', { n: order })}
          </p>
          <h3 id={id} className="m-0 text-lg text-ink" lang={unit.lang} dir={dir}>
            {unit.title}
          </h3>
          {unit.description ? (
            <p className="m-0 text-ink-soft" lang={unit.lang} dir={dir}>
              {unit.description}
            </p>
          ) : null}
          <div className="flex flex-wrap gap-1.5">
            <StatusLabel tone="info">{t('add.addedTag')}</StatusLabel>
            <StatusLabel tone="neutral">
              {t('builder.blocksN', { n: unit.blocks.length })}
            </StatusLabel>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            removeAddedUnit(unit.id)
            toast.success(t('add.unitRemoved'))
            announce(t('add.unitRemoved'))
          }}
          aria-label={t('add.removeNamed', { title: unit.title })}
        >
          <Trash2 aria-hidden="true" />
          {t('add.removeUnit')}
        </Button>
      </div>
      <details className="group border-t border-border bg-sedra-pale-50/60" open>
        <summary className="flex min-h-12 cursor-pointer list-none items-center gap-2 px-4 font-semibold text-sedra-green [&::-webkit-details-marker]:hidden">
          <ChevronDown
            aria-hidden="true"
            className="size-5 transition-transform group-open:rotate-180"
          />
          {t('builder.showBlocks')}
        </summary>
        <div className="flex flex-col gap-2 px-4 pb-4">
          <AddedBlockList unitId={unit.id} startAt={1} />
          <AddBlockDialog unitId={unit.id} unitTitle={unit.title} lang={lang} />
        </div>
      </details>
    </article>
  )
}
