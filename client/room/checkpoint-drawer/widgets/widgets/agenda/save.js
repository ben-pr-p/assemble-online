import toTitleCase from 'to-title-case'
import FileSaver from 'file-saver'

export default (checkpoint, items) => {
  const d = new Date()
  const date = `${d.getMonth() + 1}-${d.getDate()}-${d.getFullYear()
    .toString()
    .slice(-2)}`

  const room = window.location.pathname.split('/').slice(-1)[0]
  const title = `${room}-${checkpoint}-${date}`

  FileSaver.saveAs(
    new Blob(
      [
        `# ${toTitleCase(title)}

${items.map(i => `## ${i.name}

${i.description}

### Notes

${i.notes}
`)}
`,
      ],
      { type: 'text/plain;charset=utf-8' }
    ),
    title + '.md'
  )
}
