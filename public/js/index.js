regionChart = mainChart.interactive;

// Updates

function updateCharts() {
  var bodyWidth = document.getElementById('page-content').offsetWidth;
  regionChart.init('.regionchart', bodyWidth/3, bodyWidth/3);
}
 updateCharts();

$('#region-buttons button').on('click', function() {
  regionChart.plotSelectedRegion(this.textContent);
})
