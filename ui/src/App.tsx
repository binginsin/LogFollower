import './styles.css'
import { Box, IconButton, Modal, TextField, Typography } from '@mui/material'
import { createContext, useEffect, useState } from 'react'
import { ContainersList } from './components/containers/containers-list'
import { ContainerLogs } from './components/logs/container-logs'

export function App() {
    const [selectedContainer, setSelectedContainer] = useState<string | null>(null)

    return (
        <div className="p-4">
            {!selectedContainer ? (
                <ContainersList onSelect={setSelectedContainer} />
            ) : (
                <ContainerLogs containerId={selectedContainer} onBack={() => setSelectedContainer(null)} />
            )}
        </div>
    )
}
