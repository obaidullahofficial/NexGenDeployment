# Plot Routes Example
from flask import Blueprint
from controllers import plot_controller

plot_bp = Blueprint('plot_bp', __name__)

plot_bp.route('/plots', methods=['POST'])(plot_controller.create_plot)
plot_bp.route('/plots', methods=['GET'])(plot_controller.get_all_plots)
