import { ListrLogger, ListrLogLevels } from '@utils'
import { delay, Listr } from 'listr2'

interface Ctx {
  input: boolean | Record<PropertyKey, boolean>
}

const logger = new ListrLogger({ useIcons: false })

let task: Listr<Ctx>

logger.log(ListrLogLevels.STARTED, 'Example for getting user input.')

task = new Listr<Ctx>(
  [
    {
      title: 'This task will get your input.',
      task: async (ctx, task): Promise<Record<PropertyKey, boolean>> =>
        ctx.input = await task.prompt<{ test: boolean, other: boolean }>([
          {
            type: 'Select',
            name: 'first',
            message: 'Please select something',
            choices: [ 'A', 'B', 'C' ],
            validate: (response): boolean | string => {
              //  i do declare you valid!
              if (response === 'A') {
                return true
              }
            }
          },
          {
            type: 'Input',
            name: 'second',
            message: 'Please type something in:'
          },
          {
            type: 'Numeral',
            name: 'third',
            message: 'I need a number badly'
          }
        ])
    },
    {
      title: 'Now I will show the input value.',
      task: (ctx, task): void => {
        task.output = [ '%o', ctx.input ]
      },
      options: {
        persistentOutput: true
      }
    }
  ],
  { concurrent: false }
)

try {
  const context = await task.run()

  logger.log(ListrLogLevels.COMPLETED, [ 'ctx: %o', context ])
} catch (e: any) {
  logger.log(ListrLogLevels.FAILED, e)
}

logger.log(ListrLogLevels.STARTED, 'You can go ahead with complicated functions with prompts as well.')
task = new Listr<Ctx>(
  [
    {
      title: 'This task will get your input.',
      task: async (ctx, task): Promise<void> => {
        ctx.input = await task.prompt<boolean>({ type: 'Toggle', message: 'Do you love me?' })

        // do something
        if (ctx.input === false) {
          throw new Error(':/')
        }
      }
    }
  ],
  { concurrent: false }
)

try {
  const context = await task.run()

  logger.log(ListrLogLevels.COMPLETED, [ 'ctx: %o', context ])
} catch (e: any) {
  logger.log(ListrLogLevels.FAILED, e)
}

logger.log(ListrLogLevels.STARTED, 'More complicated prompt.')
task = new Listr<Ctx>(
  [
    {
      title: 'This task will get your input.',
      task: async (ctx, task): Promise<void> => {
        ctx.input = await task.prompt<boolean>({
          type: 'Select',
          message: 'Do you love me?',
          choices: [ 'test', 'test', 'test', 'test' ]
        })
      }
    }
  ],
  { concurrent: false }
)

try {
  const context = await task.run()

  logger.log(ListrLogLevels.COMPLETED, [ 'ctx: %o', context ])
} catch (e: any) {
  logger.log(ListrLogLevels.FAILED, e)
}

logger.log(ListrLogLevels.STARTED, 'Very complicated prompt.')
task = new Listr<Ctx>(
  [
    {
      title: 'This task will get your input.',
      task: async (ctx, task): Promise<void> => {
        ctx.input = await task.prompt({
          type: 'Survey',
          message: 'Please rate your experience',
          scale: [
            { name: '1', message: 'Strongly Disagree' },
            { name: '2', message: 'Disagree' },
            { name: '3', message: 'Neutral' },
            { name: '4', message: 'Agree' },
            { name: '5', message: 'Strongly Agree' }
          ],
          margin: [ 0, 0, 2, 1 ],
          choices: [
            {
              name: 'interface',
              message: 'The website has a friendly interface.'
            },
            {
              name: 'navigation',
              message: 'The website is easy to navigate.'
            },
            {
              name: 'images',
              message: 'The website usually has good images.'
            },
            {
              name: 'upload',
              message: 'The website makes it easy to upload images.'
            },
            {
              name: 'colors',
              message: 'The website has a pleasing color palette.'
            }
          ]
        })
      }
    }
  ],
  { concurrent: false }
)

try {
  const context = await task.run()

  logger.log(ListrLogLevels.COMPLETED, [ 'ctx: %o', context ])
} catch (e: any) {
  logger.log(ListrLogLevels.FAILED, e)
}

logger.log(ListrLogLevels.STARTED, 'Skipping a prompt.')
task = new Listr<Ctx>(
  [
    {
      title: 'This task will execute.',
      task: async (ctx, task): Promise<void> => {
        delay(1000)
          .then(() => task.skip('Skip this task.'))
          .catch(() => {})
        ctx.input = await task.prompt({
          type: 'Input',
          message: 'Give me some input.'
        })
      }
    },

    {
      title: 'Another task.',
      task: async (): Promise<void> => {
        await delay(1000)
      }
    }
  ],
  {
    concurrent: false
  }
)

try {
  const context = await task.run()

  logger.log(ListrLogLevels.COMPLETED, [ 'ctx: %o', context ])
} catch (e: any) {
  logger.log(ListrLogLevels.FAILED, e)
}

logger.log(ListrLogLevels.STARTED, 'Canceling a prompt.')
task = new Listr<Ctx>(
  [
    {
      title: 'This task will execute and cancel the prompts.',
      task: async (ctx, task): Promise<void> => {
        delay(1000)
          .then(() => task.cancelPrompt())
          .catch(() => {})
        ctx.input = await task.prompt({
          type: 'Input',
          message: 'Give me input before it disappears.'
        })

        delay(1000)
          .then(() => task.cancelPrompt())
          .catch(() => {})
        ctx.input = await task.prompt([
          {
            name: 'hello',
            type: 'Input',
            message: 'This one will disappear.'
          },
          {
            name: 'hello2',
            type: 'Input',
            message: 'But this one won\'t.'
          }
        ])

        delay(1000)
          .then(() => task.cancelPrompt({ throw: true }))
          .catch(() => {})
        ctx.input = await task.prompt({
          type: 'Input',
          message: 'This input will throw an error :/.'
        })
      }
    },
    {
      title: 'Another task.',
      task: async (ctx, task): Promise<void> => {
        ctx.input = await task.prompt({
          type: 'Input',
          message: 'Prompt afterwards.'
        })
        await delay(1000)
      }
    }
  ],
  {
    concurrent: false
  }
)

try {
  const context = await task.run()

  logger.log(ListrLogLevels.COMPLETED, [ 'ctx: %o', context ])
} catch (e: any) {
  logger.log(ListrLogLevels.FAILED, e)
}
