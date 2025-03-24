import React, { useEffect, useState, useRef } from 'react'
import { DdClientProvider } from '../../services/dd-client-provider'
import { Button, Paper, Typography } from '@mui/material'

// Utility function to parse ANSI escape codes and apply styles
const colorizeLogs = (text: string) => {
    const colorMap: Record<string, string> = {
        '30': 'color: black;', // black
        '31': 'color: red;', // red
        '32': 'color: green;', // green
        '33': 'color: yellow;', // yellow
        '34': 'color: blue;', // blue
        '35': 'color: magenta;', // magenta
        '36': 'color: cyan;', // cyan
        '37': 'color: white;', // white
        '39': 'color: inherit;', // reset to default
        '0': 'color: inherit;', // reset all styles
    }

    //[30m2025-03-24 19:56:55,166[0;39m [31mWARN [0;39m [[34mmain[0;39m] [33mc.p.k.u.c.a.DisabledAuthSecurityConfig[0;39m: Authentication is disabled. Access will be unrestricted.
    //[30m2025-03-24 19:56:55,463[0;39m [34mINFO [0;39m [[34mmain[0;39m] [33mo.s.b.a.e.w.EndpointLinksResolver[0;39m: Exposing 3 endpoint(s) beneath base path '/actuator'

    // Only process text containing control characters to avoid colorizing non-log content
    const controlCodeRegex = /\x1b\[[0-9;]+m/g
    let processedText = text.replace(controlCodeRegex, (match) => {
        const codes = match.slice(2, -1).split(';')
        const styles = codes.map((code) => colorMap[code] || '').join(' ')
        return codes[0] == '0' ? '[0m' : '' + `<span style="${styles}">`
    })

    processedText = processedText.replace(/\x1b\[0m/g, '</span>') // Close the span tag when reset code is encountered
    return processedText
}

export const ContainerLogs: React.FC<{ containerId: string; onBack: () => void }> = ({ containerId, onBack }) => {
    const [logs, setLogs] = useState<string[]>([])
    const [autoScroll, setAutoScroll] = useState<boolean>(true)
    const logContainerRef = useRef<HTMLDivElement>(null)
    const ddClient = DdClientProvider.getClient()

    useEffect(() => {
        const fetchLogs = async () => {
            const stream = await ddClient.docker.cli.exec('logs', ['--follow', containerId], {
                stream: {
                    onOutput(data) {
                        if (data.stdout) {
                            setLogs((prevLogs) => [...prevLogs, ...data.stdout.split('\n')])
                        } else if (data.stderr) {
                            setLogs((prevLogs) => [...prevLogs, ...data.stderr.split('\n')])
                        }
                    },
                    onError(error) {
                        console.error(error)
                    },
                    onClose(exitCode) {
                        console.log('onClose with exit code ' + exitCode)
                    },
                    splitOutputLines: true,
                },
            })

            return () => stream.close()
        }

        fetchLogs()
    }, [containerId])

    useEffect(() => {
        // Scroll to bottom initially when container logs are first loaded
        if (logContainerRef.current && autoScroll) {
            logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight
        }
    }, [logs, autoScroll])

    const handleScroll = () => {
        if (logContainerRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = logContainerRef.current
            // Disable auto-scroll if the user has scrolled up, enable when at the bottom
            if (scrollTop + clientHeight < scrollHeight - 5) {
                setAutoScroll(false)
            } else {
                setAutoScroll(true)
            }
        }
    }

    return (
        <Paper className="p-4 border-none">
            <Button variant="contained" color="secondary" onClick={onBack} className="mb-4">
                Back to Containers
            </Button>
            <Typography variant="h5" gutterBottom className="mt-4">
                Logs for {containerId}
            </Typography>
            <Paper
                className="p-4 bg-black text-white overflow-auto h-[calc(100vh-140px)] border-2 border-gray-800"
                style={{ overflowX: 'auto' }}
                ref={logContainerRef}
                onScroll={handleScroll}
            >
                <pre>
                    {logs.map((line, index) => (
                        <div key={index} dangerouslySetInnerHTML={{ __html: colorizeLogs(line) }} />
                        //   <div key={index} >{line}</div>
                    ))}
                </pre>
            </Paper>
        </Paper>
    )
}
