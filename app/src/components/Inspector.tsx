import { useEffect, useRef, useState } from 'react';
import type { WorkspaceAction } from '../lib/reducer';
import { IDEA_COLORS } from '../lib/types';
import type { Group, Id, Idea, SessionBundle } from '../lib/types';
import { AiPanel } from './AiPanel';
import { Icon } from './Icon';
import { Button, IconButton } from './primitives';

interface InspectorProps {
  bundle: SessionBundle;
  idea: Idea;
  onClose: () => void;
  dispatch: (action: WorkspaceAction) => void;
}

export function Inspector({ bundle, idea, onClose, dispatch }: InspectorProps) {
  const [tagDraft, setTagDraft] = useState('');
  const textRef = useRef<HTMLTextAreaElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    textRef.current?.focus();
  }, [idea.id]);

  const update = (patch: Partial<Idea>) => dispatch({ type: 'idea/update', id: idea.id, patch });

  const addTag = () => {
    const tag = tagDraft.trim();
    if (!tag) return;
    dispatch({ type: 'idea/addTag', ids: [idea.id], tag });
    setTagDraft('');
  };

  const groupOf = bundle.groups.find((group) => group.id === idea.groupId) ?? null;

  return (
    <aside
      ref={panelRef}
      className="inspector"
      aria-label="Idea details"
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          event.stopPropagation();
          onClose();
        }
      }}
    >
      <header className="inspector__head">
        <IconButton icon="close" label="Close idea details" onClick={onClose} />
        <span className="spacer" />
        <IconButton
          icon="star"
          label={idea.favorite ? 'Remove favourite' : 'Mark as favourite'}
          filled={idea.favorite}
          aria-pressed={idea.favorite}
          onClick={() => dispatch({ type: 'idea/toggleFavorite', ids: [idea.id] })}
        />
        <IconButton
          icon="copy"
          label="Duplicate idea"
          onClick={() => dispatch({ type: 'idea/duplicate', ids: [idea.id] })}
        />
        <IconButton
          icon="trash"
          label="Delete idea"
          onClick={() => {
            dispatch({ type: 'idea/delete', ids: [idea.id] });
            onClose();
          }}
        />
      </header>

      <div className="inspector__body">
        <label className="field">
          <span className="field__label">Idea</span>
          <textarea
            ref={textRef}
            className="textarea"
            style={{ minHeight: 80 }}
            value={idea.text}
            placeholder="What is the idea?"
            onChange={(event) => update({ text: event.target.value })}
          />
        </label>

        <label className="field">
          <span className="field__label">Notes</span>
          <textarea
            className="textarea"
            value={idea.note}
            placeholder="Detail, context, why it might work…"
            onChange={(event) => update({ note: event.target.value })}
          />
        </label>

        <section className="field">
          <span className="field__label">Tags</span>
          <div className="row row--wrap">
            {idea.tags.map((tag) => (
              <span className="chip" key={tag}>
                #{tag}
                <button
                  type="button"
                  className="chip__remove"
                  aria-label={`Remove tag ${tag}`}
                  onClick={() => dispatch({ type: 'idea/removeTag', ids: [idea.id], tag })}
                >
                  <Icon name="close" size={11} />
                </button>
              </span>
            ))}
          </div>
          <div className="row">
            <input
              className="input"
              placeholder="Add a tag"
              value={tagDraft}
              onChange={(event) => setTagDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  addTag();
                }
              }}
              aria-label="Add a tag"
            />
            <Button onClick={addTag} disabled={!tagDraft.trim()}>
              Add
            </Button>
          </div>
        </section>

        <section className="field">
          <span className="field__label">Colour</span>
          <div className="swatches">
            {IDEA_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                className="swatch"
                style={{ ['--swatch' as string]: `var(--c-${color}-bg)`, borderColor: `var(--c-${color}-line)` }}
                aria-label={`Colour: ${color}`}
                aria-pressed={idea.color === color}
                onClick={() => dispatch({ type: 'idea/setColor', ids: [idea.id], color })}
              />
            ))}
          </div>
        </section>

        <GroupPicker
          groups={bundle.groups}
          current={groupOf}
          onSelect={(groupId) => dispatch({ type: 'idea/setGroup', ids: [idea.id], groupId })}
          onCreate={(name) => dispatch({ type: 'group/add', name, ideaIds: [idea.id] })}
        />

        <AiPanel
          bundle={bundle}
          focusIdea={idea}
          onAcceptIdea={(text) => dispatch({ type: 'idea/addMany', texts: [text], near: idea.id })}
          onAcceptAction={(text) => dispatch({ type: 'action/add', text })}
          onAcceptNote={(text) =>
            update({ note: idea.note.trim() ? `${idea.note.trim()}\n\n${text}` : text })
          }
          onAcceptGroup={(name, ideaIds) => dispatch({ type: 'group/add', name, ideaIds })}
        />
      </div>

      <footer className="inspector__foot">
        <Button
          block
          icon="checkCircle"
          onClick={() => dispatch({ type: 'action/fromIdeas', ideaIds: [idea.id] })}
        >
          Send to action list
        </Button>
      </footer>
    </aside>
  );
}

function GroupPicker({
  groups,
  current,
  onSelect,
  onCreate,
}: {
  groups: Group[];
  current: Group | null;
  onSelect: (groupId: Id | null) => void;
  onCreate: (name: string) => void;
}) {
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');

  return (
    <section className="field">
      <span className="field__label">Group</span>
      <div className="row row--wrap">
        <button
          type="button"
          className="chip"
          aria-pressed={current === null}
          onClick={() => onSelect(null)}
        >
          None
        </button>
        {groups.map((group) => (
          <button
            key={group.id}
            type="button"
            className="chip"
            aria-pressed={current?.id === group.id}
            onClick={() => onSelect(group.id)}
          >
            {group.name}
          </button>
        ))}
        {!creating ? (
          <button type="button" className="chip" onClick={() => setCreating(true)}>
            <Icon name="plus" size={13} /> New group
          </button>
        ) : null}
      </div>
      {creating ? (
        <div className="row">
          <input
            className="input"
            autoFocus
            placeholder="Group name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && name.trim()) {
                onCreate(name.trim());
                setName('');
                setCreating(false);
              }
              if (event.key === 'Escape') setCreating(false);
            }}
            aria-label="New group name"
          />
          <Button
            disabled={!name.trim()}
            onClick={() => {
              onCreate(name.trim());
              setName('');
              setCreating(false);
            }}
          >
            Create
          </Button>
        </div>
      ) : null}
    </section>
  );
}
