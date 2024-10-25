import React, { useEffect, useState } from 'react';
import { Bar, Line, Pie } from 'react-chartjs-2';
import Papa from 'papaparse';
import { Chart, registerables } from 'chart.js';
import { Box, Container, Typography, Grid,Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination } from '@mui/material';

Chart.register(...registerables);

const Dashboard = () => {
  const [evData, setEvData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    Papa.parse('/ev-data.csv', {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        if (result.errors.length) {
          setError('Error parsing CSV file');
        } else {
          setEvData(result.data);
        }
        setLoading(false);
      },
      error: (err) => {
        setError('Error loading CSV file');
        setLoading(false);
      },
    });
    console.log(evData)
  }, []);

  if (loading) {
    return <Typography variant="h5">Loading data...</Typography>;
  }

  if (error) {
    return <Typography variant="h5" color="error">{error}</Typography>;
  }

    const handleChangePage = (event, newPage) => {
      setPage(newPage);
    };
  
    const handleChangeRowsPerPage = (event) => {
      setRowsPerPage(parseInt(event.target.value, 10));
      setPage(0);
    };

  const getMakesCount = () => {
    const counts = {};
    evData.forEach((ev) => {
      if (ev.Make) {
        counts[ev.Make] = (counts[ev.Make] || 0) + 1;
      }
    });
    return counts;
  };

  const getElectricRangeData = () => {
    const rangeData = evData
      .filter(ev => ev.Make && ev.Model && ev['Electric Range'] && !isNaN(parseFloat(ev['Electric Range'].trim())))
      .map(ev => ({
        label: `${ev.Make} ${ev.Model}`,
        range: parseFloat(ev['Electric Range'].trim()),
      }))
      .sort((a, b) => b.range - a.range)
      .slice(0, 50); 
  
    const labels = rangeData.map(ev => ev.label);
    const data = rangeData.map(ev => ev.range);

    console.log("Top 10 Electric Range Data:", { labels, data });
  
    return { labels, data };
  };
  
  
  const getModelYearData = () => {
    const yearCounts = {};
    evData.forEach((ev) => {
      if (ev['Model Year']) {
        yearCounts[ev['Model Year']] = (yearCounts[ev['Model Year']] || 0) + 1;
      }
    });
    return yearCounts;
  };

  const getEVsByCounty = () => {
    const countyCounts = {};
    evData.forEach((ev) => {
      if (ev.County) {
        countyCounts[ev.County] = (countyCounts[ev.County] || 0) + 1;
      }
    });
    return countyCounts;
  };


  const getEVTypeDistribution = () => {
    const typeCounts = {};
    evData.forEach((ev) => {
        if (ev['Electric Vehicle Type']) {
            typeCounts[ev['Electric Vehicle Type']] = (typeCounts[ev['Electric Vehicle Type']] || 0) + 1;
        }
    });
    return typeCounts;
};

const getPriceRange = () => {
  const priceCounts = {};
  evData.forEach((ev) => {
      const price = parseFloat(ev['Base MSRP']);
      if (!isNaN(price)) {
          const priceRange = Math.floor(price / 10000) * 10000;
          priceCounts[`${priceRange} - ${priceRange + 9999}`] = (priceCounts[`${priceRange} - ${priceRange + 9999}`] || 0) + 1;
      }
  });
  return priceCounts;
};

const priceRangeData = getPriceRange();
const priceRangeLabels = Object.keys(priceRangeData);
const priceRangeValues = Object.values(priceRangeData);

const evTypeData = getEVTypeDistribution();
const evTypeLabels = Object.keys(evTypeData);
const evTypeValues = Object.values(evTypeData);

  const makesCount = getMakesCount();
  const makeLabels = Object.keys(makesCount);
  const makeData = Object.values(makesCount);

  const electricRangeData = getElectricRangeData();
  const modelYearData = getModelYearData();
  const yearLabels = Object.keys(modelYearData);
  const yearData = Object.values(modelYearData);

  const countyData = getEVsByCounty();
  const countyLabels = Object.keys(countyData);
  const countyValues = Object.values(countyData);


  const fetchSummaryValues = (data) => {
    const totalEVs = data.length;
    const totalModelsSet = new Set();
    let totalRange = 0;

    data.forEach(ev => {
        totalModelsSet.add(`${ev.Make} ${ev.Model}`);
        
        const range = parseInt(ev["Electric Range"], 10);
        if (!isNaN(range)) {
            totalRange += range;
        }
    });

    const totalModels = totalModelsSet.size;
    const averageRange = totalEVs > 0 ? (totalRange / totalEVs).toFixed(2) : 0;

    return { totalEVs, averageRange, totalModels };
};

const { totalEVs, averageRange, totalModels } = fetchSummaryValues(evData);

  return (
    <Box 
      sx={{ 
        backgroundColor: '#f0f4f8', 
        minHeight: '100vh',
        padding: '20px',
      }}
    >
    <Container maxWidth={false} disableGutters={true} sx={{ width: 'calc(100% - 60px)', marginBlock: '20px', marginInline:"30px", padding: "30px", border: "1px solid lightgray", borderRadius: "12px", boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',backgroundColor: 'white',}}>


      <Typography variant="h3" align="center" gutterBottom>
        Electric Vehicle Dashboard
      </Typography>
      <hr/><br/>

      
<Grid container spacing={2} sx={{ marginBottom: '20px' }}>
  <Grid item xs={12} md={4}>
    <Paper
      sx={{
        padding: '20px',
        textAlign: 'center',
        backgroundColor: '#4caf50', 
        color: 'white',
        borderRadius: '8px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
        Total EVs
      </Typography>
      <Typography variant="h4" sx={{ marginTop: '10px' }}>
        {totalEVs}
      </Typography>
    </Paper>
  </Grid>

  <Grid item xs={12} md={4}>
    <Paper
      sx={{
        padding: '20px',
        textAlign: 'center',
        backgroundColor: '#2196f3',
        color: 'white',
        borderRadius: '8px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
        Average Range
      </Typography>
      <Typography variant="h4" sx={{ marginTop: '10px' }}>
        {averageRange}
      </Typography>
    </Paper>
  </Grid>

  <Grid item xs={12} md={4}>
    <Paper
      sx={{
        padding: '20px',
        textAlign: 'center',
        backgroundColor: '#ff9800', 
        color: 'white',
        borderRadius: '8px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
        Total Models
      </Typography>
      <Typography variant="h4" sx={{ marginTop: '10px' }}>
        {totalModels} 
      </Typography>
    </Paper>
  </Grid>
</Grid>

      <Grid container spacing={4}>
       
        <Grid item xs={12} md={6}>
          <Paper sx={{ padding: '20px', textAlign: 'center', backgroundColor: '#f7f7f7' }}>
            <Typography variant="h5" sx={{ marginBottom: '20px', fontWeight: 'bold' }}>
              Number of Electric Vehicles by Make
            </Typography>
            <Bar
              data={{
                labels: makeLabels,
                datasets: [
                  {
                    label: 'Count of EVs',
                    data: makeData,
                    backgroundColor: ['#f38b4a', '#56d798', '#ff8397', '#6970d5', '#ffe156'],
                  },
                ],
              }}
              options={{
                scales: { y: { beginAtZero: true } },
              }}
            />
          </Paper>
        </Grid>

        
        <Grid item xs={12} md={6}>
          <Paper sx={{ padding: '20px', textAlign: 'center', backgroundColor: '#f7f7f7' }}>
            <Typography variant="h5" sx={{ marginBottom: '20px', fontWeight: 'bold' }}>
              Top 50 Electric Range by Make and Model
            </Typography>
            <Line
              data={{
                labels: electricRangeData.labels,
                datasets: [
                  {
                    label: 'Electric Range (miles)',
                    data: electricRangeData.data,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    tension: 0.4,
                  },
                ],
              }}
              options={{
                scales: { y: { beginAtZero: true, max: 400 } },
              }}
            />
          </Paper>
        </Grid>

       
        <Grid item xs={12} md={6}>
          <Paper sx={{ padding: '20px', textAlign: 'center', backgroundColor: '#f7f7f7' }}>
            <Typography variant="h5" sx={{ marginBottom: '20px', fontWeight: 'bold' }}>
              EVs by Model Year
            </Typography>
            <Bar
              data={{
                labels: yearLabels,
                datasets: [
                  {
                    label: 'Number of EVs',
                    data: yearData,
                    backgroundColor: ['#4c9ffb', '#f38b4a', '#ff8397', '#6970d5', '#ffe156'],
                  },
                ],
              }}
              options={{
                scales: { y: { beginAtZero: true } },
              }}
            />
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
        <Paper sx={{ padding: '20px', textAlign: 'center', backgroundColor: '#f7f7f7' }}>
        <Typography variant="h5" sx={{ marginBottom: '20px', fontWeight: 'bold' }}>
      EV Count by County
    </Typography>
    <Line
      data={{
        labels: countyLabels,
        datasets: [
          {
            label: 'Count of EVs',
            data: countyValues,
            borderColor: '#36a2eb',
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            tension: 0.4,
          },
        ],
      }}
      options={{
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Number of EVs',
            },
          },
        },
        elements: {
          point: {
            radius: 5,
          },
        },
      }}
    />
  </Paper>
</Grid>

<Grid item xs={12} md={6}>
  <Paper sx={{ padding: '20px', textAlign: 'center', backgroundColor: '#f7f7f7' }}>
    <Typography variant="h5" sx={{ marginBottom: '20px', fontWeight: 'bold' }}>
      Electric Vehicle Type Distribution
    </Typography>
    <Bar
      data={{
        labels: evTypeLabels,
        datasets: [
          {
            label: 'Count of EVs',
            data: evTypeValues,
            backgroundColor: ['#ff6384', '#36a2eb', '#cc65fe', '#ffce56', '#fb8861'],
          },
        ],
      }}
      options={{
        scales: { y: { beginAtZero: true } },
      }}
    />
  </Paper>
</Grid>

<Grid item xs={12} md={6}>
  <Paper sx={{ padding: '20px', textAlign: 'center', backgroundColor: '#f7f7f7' }}>
    <Typography variant="h5" sx={{ marginBottom: '20px', fontWeight: 'bold' }}>
      Base MSRP Distribution
    </Typography>
    <Bar
      data={{
        labels: priceRangeLabels,
        datasets: [
          {
            label: 'Count of EVs',
            data: priceRangeValues,
            backgroundColor: '#ffce56',
          },
        ],
      }}
      options={{
        scales: { y: { beginAtZero: true } },
      }}
    />
  </Paper>
</Grid>

      
<Grid item xs={12}>
  <Paper sx={{ padding: '20px', textAlign: 'center', backgroundColor: '#f7f7f7' }}>
    <Typography variant="h5" sx={{ marginBottom: '20px', fontWeight: 'bold' }}>
      Electric Vehicle Details
    </Typography>
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Make</TableCell>
            <TableCell>Model</TableCell>
            <TableCell>Year</TableCell>
            <TableCell>Electric Range (miles)</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {evData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((ev, index) => (
            <TableRow key={index}>
              <TableCell>{ev.Make}</TableCell>
              <TableCell>{ev.Model}</TableCell>
              <TableCell>{ev['Model Year']}</TableCell>
              <TableCell>{ev['Electric Range']}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
    <TablePagination
      component="div"
      count={evData.length}
      page={page}
      onPageChange={handleChangePage}
      rowsPerPage={rowsPerPage}
      onRowsPerPageChange={handleChangeRowsPerPage}
    />
  </Paper>
</Grid>
      </Grid>
      <br/>
    </Container>
    </Box>
    
  );
};

export default Dashboard;
