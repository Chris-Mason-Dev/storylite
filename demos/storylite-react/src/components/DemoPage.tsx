import { ReactButton } from './ReactButton'
import { ReactCard } from './ReactCard'
import { ReactField } from './ReactField'
import { ReactLayout } from './ReactLayout'

export function DemoPage() {
  return (
    <section className="grid max-w-[900px] gap-[22px] p-8">
      <header>
        <p className="m-0 text-[color:var(--react-muted)]">React demo</p>
        <h1 className="m-0 max-w-[18ch] text-[length:clamp(2rem,1.7rem_+_2vw,3.4rem)] leading-none text-balance">
          React components rendered by the StoryLite adapter
        </h1>
      </header>

      <div className="flex flex-wrap gap-3">
        <ReactButton label="Save changes" variant="primary" />
        <ReactButton label="Open preview" variant="secondary" />
      </div>

      <ReactCard
        eyebrow="Adapter"
        title="React renderer"
        body="The StoryLite core stays renderer-neutral while React mounts and unmounts in the iframe."
      />
      <ReactField label="Project name" placeholder="storylite-demo" />
      <ReactLayout first="Normalize" second="Render" third="Cleanup" />
    </section>
  )
}
