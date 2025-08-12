# Floor Plan Routes Example
from flask import Blueprint
from controllers import floorplan_controller

floorplan_bp = Blueprint('floorplan_bp', __name__)

floorplan_bp.route('/floorplans', methods=['POST'])(floorplan_controller.save_floorplan)
floorplan_bp.route('/floorplans/user/<user_id>', methods=['GET'])(floorplan_controller.get_user_floorplans)
