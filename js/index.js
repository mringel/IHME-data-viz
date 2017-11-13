
//global state vars
var gState = {
  cAgeGroupId: '38',
  cCountry: ''
}

regionChart = mainChart.interactive;
countryChart = countryChart.interactive;

// Updates

function updateCharts() {
  var bodyWidth = document.getElementById('page-content').offsetWidth;
  regionChart.init('.regionchart', bodyWidth/3, bodyWidth/3);
}
 updateCharts();

// event listener for charting regions
$('#region-buttons button').on('click', function() {
  regionChart.plotSelectedRegion(this.textContent);
})

// // event listener for selecting age group
// $('.dropdown-item').click(function(e) {
//     var name = e.currentTarget;
//     console.log(name.getAttribute("data-id"));
// });

$('.age-dropdown').click(function(e) {
    e.preventDefault();
    var age = e.currentTarget;
    gState.cAgeGroupId = age.getAttribute('data-id');
    countryChart.plotCountry(regionChart.getAllData(), regionChart.xScale, regionChart.yScale);
    d3.select('.ageinfo').select('p').html(age.innerText);
});
