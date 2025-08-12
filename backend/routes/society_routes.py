# Society Routes Example
from flask import Blueprint
from controllers import society_controller

society_bp = Blueprint('society_bp', __name__)

society_bp.route('/societies', methods=['POST'])(society_controller.create_society)
society_bp.route('/societies', methods=['GET'])(society_controller.get_all_societies)
