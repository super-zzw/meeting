export default function methods(notify) {
  notify.successMessage = function successMessage(text, duration = 2000) {
    this({
      group: 'success',
      text,
      duration
    });
  };

  notify.errorMessage = function successMessage(text, duration = 2000) {
    this({
      group: 'error',
      text,
      duration
    });
  };

  notify.warnMessage = function successMessage(text, duration = 2000) {
    this({
      group: 'warning',
      text,
      duration
    });
  };
}
