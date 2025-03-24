import React, { useEffect, useState } from 'react'
import { Button, Paper, Typography, Box } from '@mui/material'
import { Container } from '../../interfaces/container'
import { DdClientProvider } from '../../services/dd-client-provider'

export const ContainersList: React.FC<{ onSelect: (id: string) => void }> = ({ onSelect }) => {
    const [containers, setContainers] = useState<Container[]>([])
    const ddClient = DdClientProvider.getClient()

    useEffect(() => {
        const fetchContainers = async () => {
            const result = (await ddClient.docker.listContainers({ all: true })) as Container[]
            setContainers(result)
        }

        fetchContainers()
    }, [])

  return (
      <Paper className="p-4">
          <Typography variant="h5" gutterBottom>
              Docker Containers
          </Typography>
          <div className="space-y-2">
              {containers.map((container) => (
                  <Paper key={container.Id} className="p-4 rounded-lg shadow-md flex justify-between items-center w-full min-h-[80px]">
                      <div className="flex-1 min-w-0">
                          <Typography variant="h6" noWrap>
                              {container.Names[0]}
                          </Typography>
                          <Typography variant="body2" color="textSecondary" noWrap>
                              {container.Image}
                          </Typography>
                          <Typography variant="body1" className={`mt-2 ${container.State === 'running' ? 'text-green-600' : 'text-red-600'}`}>
                              {container.State}
                          </Typography>
                      </div>
                      <Button variant="contained" className="ml-4 min-w-[120px] flex-shrink-0" onClick={() => onSelect(container.Names[0])}>
                          View Logs
                      </Button>
                  </Paper>
              ))}
          </div>
      </Paper>
  )
}
