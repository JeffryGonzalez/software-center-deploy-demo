- Lunch 12:30 - 1:30 ET
- Done teaching at ~4:30 PM ET
- Class ends at 5:00 PM ET

## Opinionated

- Angular is opinionated
- Jeff is VERY opinionated
  - Bundling
  - Writing applications in a team of developers that are all simultaneously working on the same app.
    - I HATE HATE HATE Merge Conflicts. So I don't have them.
  - I try to use the newer Angular style guide where you don't put the role of a file in the name of the file (`app.component.ts` => `app.ts`)
  - I _prefer_ inline styles and inline templates. I have REASONS, but you don't have to agree.
  - ng g c tacos
    - in app you would have:
      - tacos
        - tacos.html - the "template"
        - tacos.ts - component file - do I really need a folder for this?
        - tacos.css
        - tacos.spec.ts - I don't like these. I just always redo them myself (we can talk at 4:30, or my Angular testing class)
- Your opininions are valid, but this is my class. lol. ;)

- Building - Bundling - HUGELY important
  - You have to have a file layout that supports that.

- Keep the "app" portion of your Angular app _tiny_ - don't put a bunch of components, etc. in here.

- We break things in to "areas" for a couple reasons:
  - They change as a "unit" - everything in that area will need to be redeployed to the users of your application on any change.
  - They also allow us to break up work across the team (again, Merge conflicts are supposed to hurt.)
