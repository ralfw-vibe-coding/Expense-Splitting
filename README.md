# Multi-Project Repo

In diesem Repo fasse ich mehrere Projekte zusammen.

Jedes beginnt in der Root.

Jedes bekommt einen eigenen main-Branch, z.B. `projectA - main`, `projectB - main` usw.

Wenn Projekte weitere Branches brauchen, können sie so anlegen: `<project name> - <branch name>`

Verschiedene Projekte könnten auch in Unterverzeichnissen liegen. Aber das unterstützen
Deployment-Services wie Netlify nicht. Bei ihnen kann man ein Repo anbinden und einen Branch
wählen - doch dann wird erwartet, das alles von der Root ausgeht.

Mit mehreren Branches gleich vom Start weg, kann das Problem gelöst werden.

Wenn sich ein Projekt größer entwickelt, kann ich es später immer noch in ein eigenes Repo
auslagern.
