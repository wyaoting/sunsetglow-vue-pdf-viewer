

const lang = {
    zh: {
        Preparing: "准备文档以供打印"
    },
    en: {
        Preparing: "Preparing document for printing"
    }
}
import { configOption } from './config'

export const t = (key: string) => {
    //@ts-ignore
    return (configOption.value.lang && lang[configOption.value.lang] && lang[configOption.value.lang][key]) || key
}