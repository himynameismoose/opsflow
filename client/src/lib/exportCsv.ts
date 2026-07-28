interface WorkflowRequest {
    id: string
    title: string
    description: string
    status: string
    createdAt: string
    requester: {
        name: string
        email: string
    }
    assignedTo: {
        name: string
    } | null
}

export const exportToCSV = (requests: WorkflowRequest[]) => {
    // Define column headers
    const headers = [
        'ID',
        'Title',
        'Description',
        'Status',
        'Requester',
        'Requester Email',
        'Assigned To',
        'Created Date',
    ]

    // Transform each request into a CSV row
    const rows = requests.map(req => [
        req.id,
        `"${req.title.replace(/"/g, '""')}"`,
        `"${req.description.replace(/"/g, '""')}"`,
        req.status,
        req.requester.name,
        req.requester.email,
        req.assignedTo?.name || 'Unassigned',
        new Date(req.createdAt).toLocaleDateString(),
    ])

    // Combine headers and rows into CSV string
    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
    ].join('\n')

    // Trigger browser download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `opsflow-requests-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
}