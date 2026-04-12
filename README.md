# Unified Project Hub

Single deployable website containing all requested project pages from Zoande and DH4410.

## Included Repositories (Cloned Locally)

- repos/Zoande__BrokerSIM
- repos/Zoande__ahhh
- repos/Zoande__onlineagent
- repos/Zoande__Call-of-idk
- repos/DH4410__Polymarket-Bot
- repos/DH4410__typing-platformer
- repos/DH4410__BrokerSIM
- repos/DH4410__CityBuilder
- repos/DH4410__task-sorter-app
- repos/DH4410__ISRLO-IBDP-subject
- repos/DH4410__sticky-notes-app
- repos/DH4410__studymaster
- repos/DH4410__Swapspot

## Website Structure

- index.html: homepage with all project cards
- projects/*.html: one dedicated page per project
- data/projects.js: shared project metadata/content source
- scripts/home.js: homepage renderer
- scripts/project.js: project page renderer
- styles.css: global styling

## Local Preview

Any static file server works. Example using Node:

```powershell
npx serve .
```

Then open the shown local URL.

## Deploy to Vercel

1. Push this folder to a GitHub repository.
2. Import that repository in Vercel.
3. Keep default settings (static deployment).
4. Deploy.

## Notes

- This deliverable is a unified project showcase + status tracker.
- Each page documents current implementation state and next delivery steps based on source inspection.
