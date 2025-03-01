import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Search, Download, Share2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Base API URL - replace with your actual backend URL
const API_BASE_URL = 'http://localhost:5000';

const ResearchGraph = () => {
    // State variables
    const [query, setQuery] = useState('Artificial Intelligence');
    const [maxResults, setMaxResults] = useState(10);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [graphGenerated, setGraphGenerated] = useState(false);
    const [paperTitle, setPaperTitle] = useState('');
    const [recommendations, setRecommendations] = useState([]);
    const [exportFormat, setExportFormat] = useState('gexf');
    const [graphHtml, setGraphHtml] = useState(null);
    const [availablePapers, setAvailablePapers] = useState([]);

    // Reference for the iframe
    const iframeRef = useRef(null);

    // Reset status messages after 5 seconds
    useEffect(() => {
        const timer = setTimeout(() => {
            setError(null);
            setSuccess(null);
        }, 5000);
        return () => clearTimeout(timer);
    }, [error, success]);

    // Generate knowledge graph
    const handleGenerateGraph = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.post(`${API_BASE_URL}/api/graph/generate`, {
                query,
                max_results: maxResults
            });
            setSuccess('Graph generated successfully!');
            setGraphGenerated(true);

            // Load the graph visualization after generation
            loadGraphVisualization();

            // Fetch available papers for dropdown
            fetchAvailablePapers();
        } catch (err) {
            setError(`Error generating graph: ${err.response?.data?.error || err.message}`);
        } finally {
            setLoading(false);
        }
    };

    // Fetch available papers from the graph
    const fetchAvailablePapers = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/graph/papers`);
            if (response.data && response.data.papers) {
                setAvailablePapers(response.data.papers);
                // Auto-select the first paper if available
                if (response.data.papers.length > 0) {
                    setPaperTitle(response.data.papers[0]);
                }
            }
        } catch (err) {
            console.error("Error fetching paper titles:", err);
            setError("Could not load paper titles from the graph");
        }
    };

    // Load the graph visualization
    const loadGraphVisualization = async () => {
        try {
            // Fetch the HTML content directly
            const response = await axios.get(`${API_BASE_URL}/api/graph/visualize`, {
                responseType: 'text',
                headers: {
                    'Accept': 'text/html'
                }
            });

            setGraphHtml(response.data);

            // Update iframe if it exists
            if (iframeRef.current) {
                const iframe = iframeRef.current;
                const doc = iframe.contentDocument || iframe.contentWindow.document;
                doc.open();
                doc.write(response.data);
                doc.close();
            }
        } catch (err) {
            console.error("Error loading graph visualization:", err);
            setError("Could not load graph visualization. Please try again.");
        }
    };

    // Effect to load graph visualization when the component mounts or when graphGenerated changes
    useEffect(() => {
        if (graphGenerated) {
            loadGraphVisualization();
        }
    }, [graphGenerated]);

    // Get recommendations for a paper
    const handleGetRecommendations = async () => {
        if (!paperTitle) {
            setError('Please select a paper from the dropdown');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${API_BASE_URL}/api/graph/recommend`, {
                params: { title: paperTitle, top_n: 5 }
            });

            // Check if we received an error message from the backend
            if (response.data.error) {
                throw new Error(response.data.error);
            }

            // Make sure recommendations exist before setting state
            if (response.data.recommendations) {
                setRecommendations(response.data.recommendations);
                setSuccess('Recommendations retrieved successfully!');
            } else {
                setRecommendations([]);
                setError('No recommendations found');
            }
        } catch (err) {
            setError(`Error getting recommendations: ${err.response?.data?.error || err.message}`);
            setRecommendations([]);
        } finally {
            setLoading(false);
        }
    };

    // Download visualization or export file
    const handleDownload = async (type) => {
        if (!graphGenerated) {
            setError('Please generate a graph first');
            return;
        }

        setLoading(true);
        try {
            let url = `${API_BASE_URL}/api/graph/visualize`;

            if (type === 'export') {
                url = `${API_BASE_URL}/api/graph/export?format=${exportFormat}`;
            }

            // This will trigger file download
            window.open(url, '_blank');
            setSuccess(`${type === 'export' ? 'Export' : 'Visualization'} download initiated`);
        } catch (err) {
            setError(`Error downloading: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto py-8 px-4">
            <h1 className="text-3xl font-bold mb-6 text-center">Research Knowledge Graph</h1>

            {/* Status messages */}
            {error && (
                <Alert variant="destructive" className="mb-4">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {success && (
                <Alert className="mb-4 bg-green-50 border-green-500">
                    <AlertTitle>Success</AlertTitle>
                    <AlertDescription>{success}</AlertDescription>
                </Alert>
            )}

            <Tabs defaultValue="generate" className="w-full">
                <TabsList className="grid grid-cols-3 mb-4">
                    <TabsTrigger value="generate">Generate Graph</TabsTrigger>
                    <TabsTrigger value="visualize">Visualize & Export</TabsTrigger>
                    <TabsTrigger value="recommend">Recommendations</TabsTrigger>
                </TabsList>

                {/* Generate Graph Tab */}
                <TabsContent value="generate">
                    <Card>
                        <CardHeader>
                            <CardTitle>Generate Knowledge Graph</CardTitle>
                            <CardDescription>
                                Search for academic papers and generate a knowledge graph
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex flex-col space-y-2">
                                <label htmlFor="query" className="font-medium">Search Query</label>
                                <Input
                                    id="query"
                                    placeholder="e.g., Artificial Intelligence, Machine Learning"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                />
                            </div>

                            <div className="flex flex-col space-y-2">
                                <label htmlFor="maxResults" className="font-medium">
                                    Maximum Results: {maxResults}
                                </label>
                                <Slider
                                    id="maxResults"
                                    min={5}
                                    max={50}
                                    step={5}
                                    value={[maxResults]}
                                    onValueChange={(value) => setMaxResults(value[0])}
                                />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button
                                className="w-full"
                                onClick={handleGenerateGraph}
                                disabled={loading}
                            >
                                {loading ? 'Generating...' : 'Generate Graph'}
                                {!loading && <Search className="ml-2 h-4 w-4" />}
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                {/* Visualize & Export Tab */}
                <TabsContent value="visualize">
                    <Card>
                        <CardHeader>
                            <CardTitle>Visualize and Export Graph</CardTitle>
                            <CardDescription>
                                Explore the interactive visualization or export the graph data
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {!graphGenerated ? (
                                <div className="text-center p-4 bg-yellow-50 rounded-md">
                                    <p className="text-yellow-600">Please generate a graph first</p>
                                </div>
                            ) : (
                                <div className="w-full h-96 border rounded-lg overflow-hidden">
                                    <iframe
                                        ref={iframeRef}
                                        title="Research Knowledge Graph Visualization"
                                        className="w-full h-full"
                                        srcDoc={graphHtml}
                                        sandbox="allow-scripts allow-same-origin"
                                    />
                                </div>
                            )}

                            <div className="flex flex-col space-y-2 mt-4">
                                <label htmlFor="exportFormat" className="font-medium">Export Format</label>
                                <Select value={exportFormat} onValueChange={setExportFormat}>
                                    <SelectTrigger id="exportFormat">
                                        <SelectValue placeholder="Select format" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="gexf">GEXF (Gephi)</SelectItem>
                                        <SelectItem value="graphml">GraphML</SelectItem>
                                        <SelectItem value="csv">CSV</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-between">
                            <Button
                                variant="outline"
                                onClick={() => handleDownload('visualize')}
                                disabled={loading || !graphGenerated}
                                className="flex-1 mr-2"
                            >
                                <Download className="mr-2 h-4 w-4" />
                                Download HTML
                            </Button>
                            <Button
                                onClick={() => handleDownload('export')}
                                disabled={loading || !graphGenerated}
                                className="flex-1 ml-2"
                            >
                                <Share2 className="mr-2 h-4 w-4" />
                                Export Graph
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                {/* Recommendations Tab */}
                <TabsContent value="recommend">
                    <Card>
                        <CardHeader>
                            <CardTitle>Paper Recommendations</CardTitle>
                            <CardDescription>
                                Get similar paper recommendations based on a paper in your graph
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {!graphGenerated ? (
                                <div className="p-4 bg-yellow-50 rounded-md text-yellow-700">
                                    Please generate a graph first to enable recommendations
                                </div>
                            ) : (
                                <>
                                    <div className="flex flex-col space-y-2">
                                        <label htmlFor="paperSelect" className="font-medium">Select Paper</label>
                                        <Select value={paperTitle} onValueChange={(value) => {
                                            setPaperTitle(value);
                                            // Auto-get recommendations when paper is selected
                                            setTimeout(() => {
                                                if (value) handleGetRecommendations();
                                            }, 100);
                                        }}>
                                            <SelectTrigger id="paperSelect">
                                                <SelectValue placeholder="Select a paper from your graph" />
                                            </SelectTrigger>
                                            <SelectContent className="max-h-80">
                                                {availablePapers.length === 0 ? (
                                                    <SelectItem value="" disabled>No papers available</SelectItem>
                                                ) : (
                                                    availablePapers.map((title, index) => (
                                                        <SelectItem key={index} value={title}>
                                                            {title.length > 60 ? title.substring(0, 57) + '...' : title}
                                                        </SelectItem>
                                                    ))
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {loading && (
                                        <div className="text-center p-4">
                                            <p>Loading recommendations...</p>
                                        </div>
                                    )}

                                    {recommendations.length > 0 && (
                                        <div className="mt-4">
                                            <h3 className="font-semibold mb-2">Similar Papers:</h3>
                                            <ul className="space-y-2">
                                                {recommendations.map((rec, index) => (
                                                    <li key={index} className="p-2 bg-gray-50 rounded-md">
                                                        <div className="font-medium">{rec[0]}</div>
                                                        <div className="text-sm text-gray-500">Similarity score: {(rec[1] * 100).toFixed(2)}%</div>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default ResearchGraph;