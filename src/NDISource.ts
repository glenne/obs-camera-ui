interface NDISource {
  sourceName: string;
}

interface NDISourceResponse {
  // Add response fields if you know them
  success?: boolean;
  message?: string;
}

export async function setNDISource(
  ipAddress: string, 
  cameraName: string
): Promise<NDISourceResponse> {
  try {
    const response = await fetch(`http://${ipAddress}:8080/connectTo`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sourceName: cameraName,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error connecting to camera:', error);
    throw error;
  }
}

// Usage example:
// const result = await connectToCamera('172.20.1.77', 'WORSHIPMACMINI.LOCAL (OBS)');