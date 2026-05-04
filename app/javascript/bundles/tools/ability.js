import { Ability } from '@casl/ability';

import { createContext } from 'react';
import { createContextualCan } from '@casl/react';

export const AbilityContext = createContext();
export const Can = createContextualCan(AbilityContext.Consumer);
export const ability = new Ability([]);
