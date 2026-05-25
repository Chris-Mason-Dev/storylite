<script lang="ts">
  import type { StoryIdCollision } from '../storylite/types'

  type Props = {
    readonly idCollisions: readonly StoryIdCollision[]
  }

  let { idCollisions }: Props = $props()
</script>

<section class="workspace" aria-label="Project errors">
  <article class="project-errors" role="alert">
    <h1>Story ID collisions</h1>
    <p>
      StoryLite found duplicate story IDs. Change story export names, move files, or customize
      <code>storyId</code> in <code>.storylite/config.ts</code>.
    </p>

    {#each idCollisions as collision (collision.id)}
      <section class="project-errors__group">
        <h2>{collision.id}</h2>
        <ul>
          {#each collision.stories as story (`${story.importPath}:${story.exportName}`)}
            <li>
              <code>{story.importPath}</code>
              <span>{story.exportName}</span>
            </li>
          {/each}
        </ul>
      </section>
    {/each}
  </article>
</section>
