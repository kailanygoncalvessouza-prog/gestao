import pb from '@/lib/pocketbase/client'
import { Setor } from '@/types'

export const getSetores = () =>
  pb.collection('setores').getFullList<Setor>({
    sort: 'ordem',
  })
