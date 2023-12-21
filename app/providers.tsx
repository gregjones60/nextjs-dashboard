// app/providers.tsx
'use client'

import {ChakraProvider, ColorModeProvider} from '@chakra-ui/react'

export function Providers({children}: { children: React.ReactNode }) {
    return <ChakraProvider>
        <ColorModeProvider>
            {children}
        </ColorModeProvider>
    </ChakraProvider>
}
