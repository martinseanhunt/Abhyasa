const state = {
  charts: ['time', 'tags'],
  currentChart: 0,
  chartInstance: ''
};

const createPractice = function( practiceType, tags, description, time, callback) {
  const post = {
    tags,
    description,
    time,
    practiceType
  };

  $.post('/practices', post, callback);
}

const updatePractice = function(id,  description, callback) {
  const data = {
    id,
    description
  }

  $.ajax({
    url: '/practices',
    type: 'PUT',
    data,
    error: ajaxErrorCallback,
    success: callback
  });
}

const deletePractice = function(id, callback) {
  $.ajax({
    url: `/practices/${id}`,
    type: 'DELETE',
    error: ajaxErrorCallback,
    success: callback
  });
}

const getTimeChart = function(callback) {
  $.ajax({
    url: '/practices/chart/time',
    type: 'GET',
    error: ajaxErrorCallback,
    success: callback
  });
}

const getTagChart = function(callback) {
  $.ajax({
    url: '/practices/chart/tags',
    type: 'GET',
    error: ajaxErrorCallback,
    success: callback
  });
}

const timeChartCallback = function(data) {

  const ctx = document.getElementById('chart').getContext('2d');
  state.chartInstance = new Chart(ctx, {
      // The type of chart we want to create
      type: 'line',

      // The data for our dataset
      data: {
          labels: data.labels,
          datasets: [{
              label: "Time practiced in minutes",
              backgroundColor: '#d3beef',
              borderColor: '#a44ba5',
              data: data.mins,
          }]
      },

      // Configuration options go here
      options: {}
  });
}

const tagChartCallback = function(data) {

  let label = "Common Themes";

  if (!data.labels.length) {
    data.labels = ['joy', 'bliss', 'fear', 'confusion', 'frustration', 'food']
    data.counts = [5, 12, 3, 5, 2, 1];
    label = "Common Themes Example - start practicing to see yours";
  }
  const ctx = document.getElementById('chart').getContext('2d');
  state.chartInstance = new Chart(ctx, {
      type: 'radar',
      data: {
        labels: data.labels,
        datasets: [{
          label: label,
          backgroundColor: 'rgba(164, 75, 165, 0.5)',
          borderColor: '#a44ba5',
          data: data.counts
        }]
      },
      options: {
        scale: {
            ticks: {
              beginAtZero: true
            }
          }
      }
  });
}

const deletePracticeCallback = function(data) {
  closeUpdatePracticeModal();
  $(`.practices__practice[data-id=${data._id}]`).remove();
  renderFlash('success', 'Your practice was deleted');
}

const updatePracticeCallback = function(data) {
  closeUpdatePracticeModal();
  renderFlash('success', 'Your journal was updated');
}

const ajaxErrorCallback = function(e,r,o) {
  $('.lightbox').addClass('hidden');
  renderFlash('error', 'Oops, there was a problem');
  // console.log(e);
  // console.log(r);
  // console.log(o);
}

const getDate = function(date) {
  var a = moment();
  var b = moment(date);

  if (moment.duration(a.diff(b)).asHours() < 3 ){
    return moment(date).fromNow();
  }
  else{
    return moment(date).format('MMMM Do YYYY'); 
  }
}

const renderPractice = function(data, status) {
  if (status === 'success') {
    resetPractice();

    const date = getDate(data.created);
    
    const practiceHTML = `
      <div data-id="${data._id}" class="practices__practice">
        <span class="practice__type">${data.time / 60} minute ${data.practiceType} practice</span>
        <span class="practice__date">${date}</span>
      </div>
    `;

    $('.practices').prepend(practiceHTML);


    let tags = '';

    data.tags.forEach(tag => {
      tags += `<li class="practice-meta__tag">${tag}</li>`;
    });

    const lightboxHTML = `
      <div class="lightbox practice-modal hidden" data-id="${data._id}">
        <div class="lightbox__content practice-modal__inner lightbox__content--left">
          <div class="practice-meta">
            <span class="practice-meta__type">${data.time / 60} minute ${data.practiceType} practice</span>
            <span class="practice-meta__date">${date}</span>

            <ul class="practice-meta__tags">
              ${tags}
            </ul>
          </div>

          <form class="form update-practice" action="/practices/update/" method="post">
            <label for="description">Practice Journal</label>
            <textarea name="description" rows="10" required="required">${data.description}</textarea>
            <input type="hidden" name="id" value="${data._id}">
            <input type="submit" value="Update Journal">
          </form>

          <a class="close" href="#">Close</a>

          <div class="delete-container">
            <a class="delete-practice" href="#" data-id="${data._id}">Delete Practice</a>
            <div class="confirm-delete-practice hidden" data-id="${data._id}"> 
              <span>Are you sure? <a class="confirm-delete-practice__confirm" href="#" data-id="${data._id}">Yes, I'm sure</a>
              <span> | </span><a class="confirm-delete-practice__cancel" href="#" data-id="${data._id}">No</a></span>
            </div>
          </div>
        </div>
      <div>
    `;

    $('.lightboxes').append(lightboxHTML);

    loadCurrentChart();
    renderFlash('success', 'Your practice was logged');
  } else {
    console.log(data);
    renderFlash('error', 'Oops, there was a problem');
  }
}

const renderFlash = function(status, message){
  const flashHTML = `
    <div class="flash flash--${status}">
      <p class="flash__text">${message}</p>
      <button class="flash__remove" onClick="this.parentElement.remove()">&times;</button>
    </div>
  `;
  $('.flash').remove();
  $('.header').after(flashHTML);
}

const showLoginModal = () => {
  $('.login-modal').removeClass('hidden');
}

const hideLightbox = function(e) {
  // We don't want to be able to hide the timer modal unless they click the button to close
  if (($(e.target).hasClass('lightbox') && !$(e.target).hasClass('timer-modal')  && !$(e.target).hasClass('submit-modal')) || $(e.target).hasClass('close'))
    $(this).addClass('hidden');
}

const closeUpdatePracticeModal = function() {
  $('.practice-modal').addClass('hidden');
  $('.update-practice input[type=submit]').prop("disabled", false).val('Update Journal');
}

const resetPractice = function() {
  clearInterval(state.timer);
  $('.lightbox').addClass('hidden');
  $('.submit-practice textarea[name=description]').val('');
  $('.submit-practice input[name=type]').val('');
  $('.submit-practice input[name=tags]').val('');
  $('.submit-practice input[name=seconds]').val('');
  $('.submit-practice input[type=submit]').prop("disabled", false).val('Log Practice');
}

const toggleLoginForm = function() {
  if( !$(this).hasClass('login-tabs__tab--active') ){
    $('.form--login').toggleClass('hidden');
    $('.form--signup').toggleClass('hidden');
    $('.login-tabs__tab').removeClass('login-tabs__tab--active')
    $(this).addClass('login-tabs__tab--active');
  }
}

const showPracticeForm = function(seconds) {
  $('.timer-modal').addClass('hidden');
  $('.submit-modal').removeClass('hidden');
  $('input[name=seconds]').val(seconds);
}

const setTime = function(s){
    // get total mins without remainder
    let m = Math.floor(s / 60);
    // set hours to nothing
    let h = 0;
    // set total hours
    h = Math.floor(m / 60);
    // set mins to minutes - the minutes we have stored as hours
    m = m - (h * 60);
    // set seconds to the remainder of total minutes
    s = Math.floor(s % 60);
    // if there's less than 10 hours prepend a 0
    h = (h >= 10) ? h : "0" + h;
    // if less than 10 mins, prepend a 0
    m = (m >= 10) ? m : "0" + m;
    // prepend 0 if seconds is less than 10
    s = (s >= 10) ? s : "0" + s;

    $('span.countdown__time-remaining').html(`${h}:${m}:${s}`);
}

const startTimer = function(e) {
  e.preventDefault();
  if ( $('input[name=mins]').val() < 1) {
    return renderFlash('error', 'Please enter at least 1 minute');
  }
  $('.timer-modal').removeClass('hidden');
  let mins = parseInt($('input[name=mins]').val()  || 0);
  if (mins === 1337){
    mins = 0;
  }
  const seconds = (mins * 60);
  let s = seconds;
  setTime(s);

  state.timer = setInterval(function(){
    if (s !== 0){
      s -= 1; 
      setTime(s);
    } else {
      document.querySelector('.countdown__audio').play();
      clearInterval(state.timer);
      showPracticeForm(seconds);
    }
  }, 1000);
}

const openPractice = function() {
  const id = $(this).attr('data-id');
  $(`.lightbox[data-id=${id}]`).removeClass('hidden');
}

const loadCurrentChart = function() {
  const chart = state.charts[state.currentChart];
  if (chart === 'time') getTimeChart(timeChartCallback);
  if (chart === 'tags') getTagChart(tagChartCallback);
}

const clearChart = function() {
  state.chartInstance.destroy();
}

const loadNextChart = function(e) {
  e.preventDefault();
  clearChart();
  if (state.currentChart < state.charts.length - 1) {
    state.currentChart ++;
    loadCurrentChart();
  } else{
    state.currentChart = 0;
    loadCurrentChart();
  }
}

const loadPrevChart = function(e) {
  e.preventDefault();
  clearChart();
  if (state.currentChart != 0 ) {
    state.currentChart --;
    loadCurrentChart();
  } else{
    state.currentChart = state.charts.length -1;
    loadCurrentChart();
  }
}


// listeners

$(function() {

  if ( $( "#chart" ).length ) loadCurrentChart();

  $('.main-home__button').click(showLoginModal);
  $('.discard').click(resetPractice);
  $('.login-tabs__tab').click(toggleLoginForm);
  $('form.timer').submit(startTimer);
  $('.next-chart').click(loadNextChart);
  $('.prev-chart').click(loadPrevChart);


  $('.practices').on('click', '.practices__practice', openPractice);

  $('.submit-practice').submit(function(e) {
    e.preventDefault();
    const type = $('.submit-practice input[name=type]').val();
    const tags = $('.submit-practice input[name=tags]').val();
    const description = $('.submit-practice textarea[name=description]').val();
    const seconds = $('.submit-practice input[name=seconds]').val();
    $(this).find('input[type=submit]').prop("disabled", true).val('Loading...');
    createPractice(type, tags, description, seconds, renderPractice);
  });


  $('.lightboxes').on('click', '.lightbox', hideLightbox);

  $('.lightboxes').on('submit', '.update-practice', function(e) {
    e.preventDefault();
    const id = $(this).find('input[name=id]').val();
    const description = $(this).find('textarea[name=description]').val();
    $(this).find('input[type=submit]').prop("disabled", true).val('Loading...');
    updatePractice(id, description, updatePracticeCallback)
  });

  $('.lightboxes').on('click', '.delete-practice', function(e) {
    e.preventDefault();
    const id = $(this).attr('data-id');
    $(this).addClass('hidden');
    $(`.confirm-delete-practice[data-id=${id}]`).removeClass('hidden');
  });

  $('.lightboxes').on('click', '.confirm-delete-practice .confirm-delete-practice__cancel', function(e) {
    e.preventDefault();
    const id = $(this).attr('data-id');
    $(`.confirm-delete-practice[data-id=${id}]`).addClass('hidden');
    $(`a.delete-practice[data-id=${id}]`).removeClass('hidden');
  });

  $('.lightboxes').on('click', '.confirm-delete-practice .confirm-delete-practice__confirm', function(e) {
    e.preventDefault();
    const id = $(this).attr('data-id');
    $(this).removeClass('confirm-delete-practice__confirm').val('Loading...');
    deletePractice(id, deletePracticeCallback);
  });


});



