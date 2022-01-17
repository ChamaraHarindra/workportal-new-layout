// left Nav select active
$(".application-nav button, .application-nav a").on("click", function () {
  $(".application-nav button, .application-nav a").removeClass("is-selected");
  $(this).addClass("is-selected");
});

// left menu tooltip
// selector and a `content` prop:
tippy("[data-tippy-content]", {
  placement: "right",
  arrow: true,
  theme: "light",
});

// open left menu panels
$("[data-toggle=offcanvas]").on("click", function () {
  $("[data-toggle=offcanvas]").removeClass("sidebar-trigger--active");
  $(this).toggleClass("sidebar-trigger--active");

  var target = $(this).data("target");

  $(".offcanvas-panel").removeClass("offcanvas");
  $(target).toggleClass("offcanvas");
  if (!$(target).hasClass("offcanvas")) {
    $("body").removeClass("no-scrolling");
    $(".application-main-content").removeClass("left-margin");
    $(".application-main-content").addClass("no-margin");
  } else {
    $("body").addClass("no-scrolling");
    $(".application-main-content").addClass("left-margin");
    $(".application-main-content").removeClass("no-margin");
  }
});

$(".close-sidebar-new, .sidemenu-overlay").on("click", function () {
  $(".offcanvas").removeClass("offcanvas");
  $("body").removeClass("no-scrolling");
  $(".application-main-content").removeClass("left-margin");
  $(".application-main-content").addClass("no-margin");
});

// left menu collapse

$(".is-expanded").on("click", function () {
  $(this).next().toggle();
  $(this).toggleClass("menu-expanded");
});
